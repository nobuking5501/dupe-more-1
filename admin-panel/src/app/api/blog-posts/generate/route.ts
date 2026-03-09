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

function generateSlug(title: string, newerDate?: string, olderDate?: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
  // 日本語タイトルはtitleSlugが空になるため、日付ベースにフォールバック
  if (titleSlug.length >= 3) return titleSlug
  if (newerDate && olderDate) return `blog-${newerDate}-${olderDate}`
  return `blog-${Date.now()}`
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json().catch(() => ({}))
    let targetDate = requestData.date

    // 日付が指定されていない場合は、最新の日報を使用
    if (!targetDate) {
      console.log('📅 日付未指定 - 最新の日報を使用')
      const latestReportsSnapshot = await adminDb
        .collection('daily_reports')
        .orderBy('reportDate', 'desc')
        .limit(1)
        .get()

      if (!latestReportsSnapshot.empty) {
        const latestReport = latestReportsSnapshot.docs[0].data() as { reportDate?: string }
        targetDate = latestReport.reportDate
        console.log('✅ 最新の日報の日付を使用:', targetDate)
      } else {
        targetDate = new Date().toISOString().split('T')[0]
        console.log('⚠️ 日報がないため、今日の日付を使用:', targetDate)
      }
    }

    console.log('📝 ブログ生成リクエスト受信 - 対象日:', targetDate || '未指定')
    await logMessage('info', `ブログ生成開始: ${targetDate || '未指定'}`)

    // 既存ブログから使用済み日付を収集
    const existingBlogsSnapshot = await adminDb.collection('blog_posts').get()
    const usedDates = new Set<string>()
    existingBlogsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.newerDate) usedDates.add(data.newerDate)
      if (data.olderDate) usedDates.add(data.olderDate)
    })

    // 全日報を取得
    const reportsSnapshot = await adminDb
      .collection('daily_reports')
      .orderBy('reportDate', 'desc')
      .get()

    const allReports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; reportDate?: string; [key: string]: any }>

    // 重複日付を除去した全日付リスト（新しい順）
    const uniqueDates = Array.from(new Set(allReports.map(r => r.reportDate).filter(Boolean) as string[]))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    // 未使用日付リスト（新しい順）
    const unusedDates = uniqueDates.filter(d => !usedDates.has(d))

    console.log('📅 全日付:', uniqueDates.length, '件 / 未使用:', unusedDates.length, '件')

    let newerDateString: string
    let olderDateString: string | null = null

    if (!targetDate) {
      // 日付未指定 → 未使用の最新2件を使用
      if (unusedDates.length < 2) {
        const errorMsg = `未使用の日報が${unusedDates.length}件しかありません。2件以上必要です。`
        console.error('❌', errorMsg)
        await logMessage('error', errorMsg)
        return NextResponse.json({ error: errorMsg }, { status: 400 })
      }
      newerDateString = unusedDates[0]
      olderDateString = unusedDates[1]
    } else {
      // 日付指定 → 指定日 + その次に古い未使用日付をペアにする
      newerDateString = targetDate
      const targetIndex = uniqueDates.indexOf(targetDate)
      if (targetIndex >= 0) {
        // 指定日より古い未使用日付を探す
        const olderUnused = uniqueDates.slice(targetIndex + 1).find(d => !usedDates.has(d))
        olderDateString = olderUnused || null
      }
      if (!olderDateString) {
        // 見つからなければ未使用の最新2件にフォールバック
        if (unusedDates.length >= 2) {
          newerDateString = unusedDates[0]
          olderDateString = unusedDates[1]
        }
      }
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

    // 小話データの存在は任意（ブログ生成には日報データのみ使用）
    console.log('✅ 日報データが揃いました - ブログ生成を開始します')
    console.log('🤖 2段階Claude APIでブログ生成中...')
    const blogData = await generateBlogPostTwoPhase(newerReport, olderReport)

    // idempotency_keyを生成
    const idempotencyKey = `blog-${newerDateString}-${olderDateString}-${Date.now()}`

    console.log('💾 Firestoreにブログを保存中...')

    // Firestoreにブログを保存
    const blogRef = adminDb.collection('blog_posts').doc()
    const blogPostData = {
      title: blogData.title,
      slug: generateSlug(blogData.title, newerDateString, olderDateString),
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
