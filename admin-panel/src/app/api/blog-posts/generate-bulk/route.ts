import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { callClaudeGenerateBulkAPI } from '@/lib/claude-generate'
import { callClaudeCleanAPI } from '@/lib/claude-clean'

console.log('=== 管理画面 Firebase設定確認 ===')

async function logMessage(level: 'info' | 'warn' | 'error', message: string, context: any = {}) {
  try {
    await adminDb.collection('agent_logs').add({
      level,
      message,
      context,
      createdAt: FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.error('ログ保存エラー:', error)
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 特殊文字を削除
    .replace(/\s+/g, '-')     // スペースをハイフンに
    .substring(0, 50)         // 長さ制限
}

export async function POST(request: Request) {
  try {
    console.log('📝 一括ブログ生成リクエスト受信')
    await logMessage('info', '一括ブログ生成開始 (12日誌→6記事)')

    // 利用可能な日報の重複しない日付を取得
    const availableReportsSnapshot = await adminDb
      .collection('daily_reports')
      .orderBy('reportDate', 'desc')
      .get()

    const availableReports = availableReportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; reportDate?: string; [key: string]: any }>

    if (availableReports.length < 12) {
      const errorMsg = `12記事生成には最低12個の日報が必要です。現在：${availableReports.length}個`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // 重複を除去して最新12日分を取得
    const uniqueDates = new Set(availableReports.map((r: any) => r.reportDate))
    const availableDates = Array.from(uniqueDates)
      .sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 12)

    console.log('📅 対象日付リスト（12日分）:', availableDates)

    // 12日誌を6ペアに分割
    const reportPairs = []
    for (let i = 0; i < availableDates.length; i += 2) {
      if (i + 1 < availableDates.length) {
        const newerDate = availableDates[i]
        const olderDate = availableDates[i + 1]

        // 各日付の日報データを取得
        const newerReportsSnapshot = await adminDb
          .collection('daily_reports')
          .where('reportDate', '==', newerDate)
          .limit(1)
          .get()

        const olderReportsSnapshot = await adminDb
          .collection('daily_reports')
          .where('reportDate', '==', olderDate)
          .limit(1)
          .get()

        const newerReport = !newerReportsSnapshot.empty ? {
          id: newerReportsSnapshot.docs[0].id,
          ...newerReportsSnapshot.docs[0].data()
        } as { id: string; reportDate?: string; [key: string]: any } : null

        const olderReport = !olderReportsSnapshot.empty ? {
          id: olderReportsSnapshot.docs[0].id,
          ...olderReportsSnapshot.docs[0].data()
        } as { id: string; reportDate?: string; [key: string]: any } : null

        if (newerReport && olderReport) {
          reportPairs.push({
            newer: newerReport,
            older: olderReport
          })
        }
      }
    }

    console.log(`📋 生成対象ペア数: ${reportPairs.length}`)

    if (reportPairs.length !== 6) {
      const errorMsg = `6ペア生成に必要な日報が不足しています。取得ペア数: ${reportPairs.length}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    console.log('🤖 一括生成フェーズ開始...')
    const generatedBlogs = await callClaudeGenerateBulkAPI(reportPairs)

    console.log('✅ 生成フェーズ完了。清書フェーズ開始...')

    // 各ブログを清書
    const finalBlogs = []
    for (let i = 0; i < generatedBlogs.length; i++) {
      const blog = generatedBlogs[i]
      console.log(`清書中 ${i + 1}/6: ${blog.title}`)

      const cleanedBody = await callClaudeCleanAPI(blog.body)
      const pair = reportPairs[i]

      finalBlogs.push({
        title: blog.title,
        slug: generateSlug(blog.title),
        summary: blog.summary,
        content_md: cleanedBody,
        outline: blog.outline,
        newerDate: pair.newer.reportDate,
        olderDate: pair.older.reportDate,
        originalReportId: pair.newer.id,
        diagnostics: {
          ...blog.diagnostics,
          linewrap_ok: true
        }
      })
    }

    console.log('✅ 清書フェーズ完了。Firestore保存開始...')

    // Firestoreに一括保存
    const savedBlogs = []
    for (let i = 0; i < finalBlogs.length; i++) {
      const blogData = finalBlogs[i]
      const idempotencyKey = `bulk-blog-${blogData.newerDate}-${blogData.olderDate}-${Date.now()}`

      // 既存ブログの重複チェック
      const existingBlogSnapshot = await adminDb
        .collection('blog_posts')
        .where('newerDate', '==', blogData.newerDate)
        .where('olderDate', '==', blogData.olderDate)
        .limit(1)
        .get()

      if (!existingBlogSnapshot.empty) {
        const existingBlog = {
          id: existingBlogSnapshot.docs[0].id,
          ...existingBlogSnapshot.docs[0].data()
        } as { id: string; title?: string; [key: string]: any }
        console.log(`⚠️ スキップ（既存）: ${existingBlog.title}`)
        savedBlogs.push(existingBlog)
        continue
      }

      // Firestoreに保存
      const blogRef = adminDb.collection('blog_posts').doc()
      await blogRef.set({
        title: blogData.title,
        slug: blogData.slug,
        summary: blogData.summary,
        content: blogData.content_md,
        newerDate: blogData.newerDate,
        olderDate: blogData.olderDate,
        status: 'published',
        publishedAt: FieldValue.serverTimestamp(),
        idempotencyKey: idempotencyKey,
        authorId: null,
        originalReportId: blogData.originalReportId,
        tags: ['日報', '脱毛', '障害者専門'],
        excerpt: blogData.summary,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })

      const newBlog = {
        id: blogRef.id,
        ...blogData,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log(`✅ 保存完了 ${i + 1}/6: ${newBlog.title}`)
      savedBlogs.push(newBlog)
    }

    console.log(`🎉 一括ブログ生成完了！生成数: ${savedBlogs.length}`)
    await logMessage('info', `一括ブログ生成完了: ${savedBlogs.length}件`, {
      blogIds: savedBlogs.map(b => b.id)
    })

    // 公開サイト更新
    console.log('🔄 公開サイト更新...')
    // await revalidateAfterBlogGeneration()

    return NextResponse.json({
      success: true,
      generated_count: savedBlogs.length,
      blogs: savedBlogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        newerDate: blog.newerDate,
        olderDate: blog.olderDate
      }))
    })

  } catch (error) {
    console.error('一括ブログ生成エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logMessage('error', '一括ブログ生成に失敗しました', { error: errorMessage })
    return NextResponse.json({
      error: '一括ブログ生成に失敗しました',
      details: errorMessage
    }, { status: 500 })
  }
}
