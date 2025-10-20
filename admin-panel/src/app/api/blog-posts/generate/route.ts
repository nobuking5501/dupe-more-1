import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { callClaudeGenerateAPI } from '@/lib/claude-generate'
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

async function generateBlogPostTwoPhase(newerReport: any, olderReport: any) {
  console.log('2段階ブログ生成開始 - 生成フェーズ')

  try {
    // Phase 1: 生成フェーズ
    const reportPair = {
      newer: newerReport,
      older: olderReport
    }

    const generatedBlog = await callClaudeGenerateAPI(reportPair)
    console.log('生成フェーズ完了 - タイトル:', generatedBlog.title)

    // Phase 2: 清書フェーズ
    console.log('清書フェーズ開始')
    const cleanedBody = await callClaudeCleanAPI(generatedBlog.body)
    console.log('清書フェーズ完了')

    return {
      title: generatedBlog.title,
      slug: generateSlug(generatedBlog.title),
      summary: generatedBlog.summary,
      content_md: cleanedBody,
      outline: generatedBlog.outline,
      diagnostics: {
        ...generatedBlog.diagnostics,
        linewrap_ok: true // 清書完了
      }
    }
  } catch (error) {
    console.error('2段階ブログ生成エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logMessage('error', '2段階ブログ生成に失敗しました', { error: errorMessage })
    throw error
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
    const requestData = await request.json()
    const targetDate = requestData.date || new Date().toISOString().split('T')[0]

    console.log('📝 ブログ生成リクエスト受信 - 対象日:', targetDate)
    await logMessage('info', `ブログ生成開始: ${targetDate}`)

    // 利用可能な日報の重複しない日付を取得
    const reportsSnapshot = await adminDb
      .collection('daily_reports')
      .orderBy('reportDate', 'desc')
      .get()

    const availableReports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; reportDate?: string; [key: string]: any }>

    if (availableReports.length < 2) {
      const errorMsg = `ブログ生成には最低2つの日報が必要です`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // 指定された日付に最も近い2つの日報を選択
    let newerDateString = targetDate
    let olderDateString = null

    // 指定日が利用可能な日報に含まれているかチェック（重複を除去）
    const uniqueDates = new Set(availableReports.map((r: any) => r.reportDate))
    const availableDates = Array.from(uniqueDates).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime())

    console.log('📅 利用可能な日付:', availableDates)
    console.log('📅 対象日付:', targetDate)

    if (availableDates.includes(targetDate)) {
      // 指定日の日報が存在する場合、それより古い日報を探す
      const targetIndex = availableDates.indexOf(targetDate)
      if (targetIndex < availableDates.length - 1) {
        olderDateString = availableDates[targetIndex + 1]
      }
    } else {
      // 指定日の日報が存在しない場合、最新の2つを使用
      newerDateString = availableDates[0]
      olderDateString = availableDates[1]
    }

    console.log('📅 選択された日付ペア:', newerDateString, '&', olderDateString)

    if (!olderDateString) {
      const errorMsg = `ペアとなる日報が見つかりません`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    console.log('📅 日付ペア:', newerDateString, '&', olderDateString)

    // 既存のブログがあるかチェック（冪等性）
    const existingBlogSnapshot = await adminDb
      .collection('blog_posts')
      .where('newerDate', '==', newerDateString)
      .where('olderDate', '==', olderDateString)
      .limit(1)
      .get()

    if (!existingBlogSnapshot.empty) {
      const existingBlog = {
        id: existingBlogSnapshot.docs[0].id,
        ...existingBlogSnapshot.docs[0].data()
      } as { id: string; title?: string; [key: string]: any }
      console.log('✅ 同じ日付ペアのブログが既に存在します:', existingBlog.title)
      await logMessage('info', `既存ブログを返却: ${existingBlog.title}`, { blogId: existingBlog.id })
      return NextResponse.json(existingBlog)
    }

    // 必要な日報データを取得（複数ある場合は最初の1件を使用）
    const newerReportsSnapshot = await adminDb
      .collection('daily_reports')
      .where('reportDate', '==', newerDateString)
      .limit(1)
      .get()

    const olderReportsSnapshot = await adminDb
      .collection('daily_reports')
      .where('reportDate', '==', olderDateString)
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

    if (!newerReport || !olderReport) {
      const missingDates = []
      if (!newerReport) missingDates.push(newerDateString)
      if (!olderReport) missingDates.push(olderDateString)

      const errorMsg = `必要な日報が見つかりません: ${missingDates.join(', ')}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    // 必要な小話データを取得
    const newerStorySnapshot = await adminDb
      .collection('short_stories')
      .where('reportDate', '==', newerDateString)
      .limit(1)
      .get()

    const olderStorySnapshot = await adminDb
      .collection('short_stories')
      .where('reportDate', '==', olderDateString)
      .limit(1)
      .get()

    if (newerStorySnapshot.empty || olderStorySnapshot.empty) {
      const missingStoryDates = []
      if (newerStorySnapshot.empty) missingStoryDates.push(newerDateString)
      if (olderStorySnapshot.empty) missingStoryDates.push(olderDateString)

      const errorMsg = `必要な小話が見つかりません: ${missingStoryDates.join(', ')}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    console.log('🤖 2段階Claude APIでブログ生成中...')
    const blogData = await generateBlogPostTwoPhase(newerReport, olderReport)

    // idempotency_keyを生成
    const idempotencyKey = `blog-${newerDateString}-${olderDateString}-${Date.now()}`

    console.log('💾 Firestoreにブログを保存中...')

    // Firestoreにブログを保存
    const blogRef = adminDb.collection('blog_posts').doc()
    const blogPostData = {
      title: blogData.title,
      slug: blogData.slug,
      summary: blogData.summary,
      content: blogData.content_md,
      newerDate: newerDateString,
      olderDate: olderDateString,
      status: 'published',
      publishedAt: FieldValue.serverTimestamp(),
      idempotencyKey: idempotencyKey,
      authorId: null,
      originalReportId: newerReport.id,
      tags: ['日報', '脱毛', '障害者専門'],
      excerpt: blogData.summary,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }

    await blogRef.set(blogPostData)

    const newBlog = {
      id: blogRef.id,
      ...blogPostData,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('✅ ブログをFirestoreに保存しました:', newBlog.id)
    await logMessage('info', `ブログ生成完了: ${newBlog.title}`, { blogId: newBlog.id })

    // ブログ生成後に公開サイトを更新
    console.log('🔄 ブログ生成後の公開サイト更新...')
    // await revalidateAfterBlogGeneration()

    return NextResponse.json(newBlog)
  } catch (error) {
    console.error('ブログ生成エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logMessage('error', 'ブログ生成に失敗しました', { error: errorMessage })
    return NextResponse.json({ error: 'ブログの生成に失敗しました' }, { status: 500 })
  }
}
