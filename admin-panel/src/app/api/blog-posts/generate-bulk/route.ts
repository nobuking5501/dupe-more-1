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

function generateSlug(title: string, newerDate?: string, olderDate?: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
  if (titleSlug.length >= 3) return titleSlug
  if (newerDate && olderDate) return `blog-${newerDate}-${olderDate}`
  return `blog-${Date.now()}`
}

export async function POST(request: Request) {
  try {
    console.log('📝 一括ブログ生成リクエスト受信')
    await logMessage('info', '一括ブログ生成開始（未使用日報を全数ペアリング）')

    // 既存ブログから使用済み日報IDを収集（IDベース管理）
    const existingBlogsSnapshot = await adminDb.collection('blog_posts').get()
    const usedReportIds = new Set<string>()
    const oldDateLookups: string[] = []

    existingBlogsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.newerReportId) usedReportIds.add(data.newerReportId)
      if (data.olderReportId) usedReportIds.add(data.olderReportId)
      // 旧形式ブログ対応: newerReportIdがなければoriginalReportIdを使用
      if (!data.newerReportId && data.originalReportId) usedReportIds.add(data.originalReportId)
      // 旧形式ブログ対応: olderReportIdがなければolderDateから検索
      if (!data.olderReportId && data.olderDate) oldDateLookups.push(data.olderDate)
    })

    // 旧形式ブログのolderReportIdを日付から補完
    for (const date of oldDateLookups) {
      const snap = await adminDb.collection('daily_reports')
        .where('reportDate', '==', date).limit(1).get()
      if (!snap.empty) usedReportIds.add(snap.docs[0].id)
    }

    console.log(`📋 使用済み日報ID: ${usedReportIds.size}件`)

    // 全日報を取得し、未使用かつ有効なものだけ抽出（IDで判定・同日複数もすべて対象）
    const allReportsSnapshot = await adminDb
      .collection('daily_reports')
      .orderBy('reportDate', 'desc')
      .get()

    const unusedReports = (allReportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; reportDate?: string; customerAttributes?: string; [key: string]: any }>)
      .filter(report => {
        if (!report.reportDate) return false
        if (usedReportIds.has(report.id)) return false
        if (!report.customerAttributes?.trim()) return false
        return true
      })

    console.log(`✅ 未使用の有効日報: ${unusedReports.length}件`)

    if (unusedReports.length < 2) {
      const msg = `未使用の日報が${unusedReports.length}件しかありません。2件以上必要です。`
      console.log(msg)
      await logMessage('info', msg)
      return NextResponse.json({ message: msg, generated_count: 0, blogs: [] })
    }

    // 2件ずつペアリング（奇数の場合は末尾1件を次回に持ち越し）
    const reportPairs: { newer: any; older: any }[] = []
    for (let i = 0; i + 1 < unusedReports.length; i += 2) {
      reportPairs.push({
        newer: unusedReports[i],
        older: unusedReports[i + 1]
      })
    }

    console.log(`📋 生成対象ペア数: ${reportPairs.length}（日報${unusedReports.length}件）`)
    await logMessage('info', `ペアリング完了: ${reportPairs.length}ペア（日報${unusedReports.length}件）`)

    console.log('🤖 一括生成フェーズ開始...')
    const generatedBlogs = await callClaudeGenerateBulkAPI(reportPairs)

    console.log('✅ 生成フェーズ完了。清書フェーズ開始...')

    const finalBlogs = []
    for (let i = 0; i < generatedBlogs.length; i++) {
      const blog = generatedBlogs[i]
      console.log(`清書中 ${i + 1}/${generatedBlogs.length}: ${blog.title}`)

      const cleanedBody = await callClaudeCleanAPI(blog.body)
      const pair = reportPairs[i]

      finalBlogs.push({
        title: blog.title,
        slug: generateSlug(blog.title, pair.newer.reportDate, pair.older.reportDate),
        summary: blog.summary,
        content_md: cleanedBody,
        newerDate: pair.newer.reportDate,
        olderDate: pair.older.reportDate,
        newerReportId: pair.newer.id,
        olderReportId: pair.older.id,
        originalReportId: pair.newer.id,
        diagnostics: { ...blog.diagnostics, linewrap_ok: true }
      })
    }

    console.log('✅ 清書フェーズ完了。Firestore保存開始...')

    const savedBlogs = []
    for (const blogData of finalBlogs) {
      const idempotencyKey = `bulk-blog-${blogData.newerDate}-${blogData.olderDate}-${Date.now()}`

      const blogRef = adminDb.collection('blog_posts').doc()
      await blogRef.set({
        title: blogData.title,
        slug: blogData.slug,
        summary: blogData.summary,
        content: blogData.content_md,
        newerDate: blogData.newerDate,
        olderDate: blogData.olderDate,
        newerReportId: blogData.newerReportId,
        olderReportId: blogData.olderReportId,
        status: 'published',
        publishedAt: FieldValue.serverTimestamp(),
        idempotencyKey,
        authorId: null,
        originalReportId: blogData.originalReportId,
        tags: ['日報', '脱毛', '障害者専門'],
        excerpt: blogData.summary,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })

      savedBlogs.push({ id: blogRef.id, ...blogData })
      console.log(`✅ 保存完了: ${blogData.title}`)
    }

    console.log(`🎉 一括ブログ生成完了！生成数: ${savedBlogs.length}`)
    await logMessage('info', `一括ブログ生成完了: ${savedBlogs.length}件`, {
      blogIds: savedBlogs.map(b => b.id)
    })

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
