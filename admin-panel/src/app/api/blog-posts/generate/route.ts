import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// // import { // getPreviousBusinessDay, // formatDateString } from '@/lib/business-days'
// // import { // revalidateAfterBlogGeneration } from '@/lib/revalidation'
import { callClaudeGenerateAPI } from '@/lib/claude-generate'
import { callClaudeCleanAPI } from '@/lib/claude-clean'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function logMessage(level: 'info' | 'warn' | 'error', message: string, context: any = {}) {
  try {
    await supabase
      .from('agent_logs')
      .insert([{ level, message, context }])
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
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error'
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
    const { data: availableReports, error: reportsError } = await supabase
      .from('daily_reports')
      .select('report_date')
      .order('report_date', { ascending: false })
    
    if (reportsError || !availableReports || availableReports.length < 2) {
      const errorMsg = `ブログ生成には最低2つの日報が必要です`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // 指定された日付に最も近い2つの日報を選択
    let newerDateString = targetDate
    let olderDateString = null
    
    // 指定日が利用可能な日報に含まれているかチェック（重複を除去）
    const uniqueDates = new Set(availableReports.map(r => r.report_date))
    const availableDates = Array.from(uniqueDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
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
    const { data: existingBlog, error: checkError } = await supabase
      .from('blog_posts')
      .select('id, title, newer_date, older_date')
      .eq('newer_date', newerDateString)
      .eq('older_date', olderDateString)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ ブログ重複チェックエラー:', checkError)
      return NextResponse.json(
        { error: 'ブログの重複チェックに失敗しました' }, 
        { status: 500 }
      )
    }

    if (existingBlog) {
      console.log('✅ 同じ日付ペアのブログが既に存在します:', existingBlog.title)
      await logMessage('info', `既存ブログを返却: ${existingBlog.title}`, { blogId: existingBlog.id })
      return NextResponse.json(existingBlog)
    }

    // 必要な日報データを取得（複数ある場合は最初の1件を使用）
    const { data: newerReports, error: newerError } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', newerDateString)
      .limit(1)

    const { data: olderReports, error: olderError } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', olderDateString)
      .limit(1)

    const newerReport = newerReports && newerReports.length > 0 ? newerReports[0] : null
    const olderReport = olderReports && olderReports.length > 0 ? olderReports[0] : null

    if (newerError || olderError || !newerReport || !olderReport) {
      const missingDates = []
      if (newerError || !newerReport) missingDates.push(newerDateString)
      if (olderError || !olderReport) missingDates.push(olderDateString)
      
      const errorMsg = `必要な日報が見つかりません: ${missingDates.join(', ')}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    // 必要な小話データを取得
    const { data: newerStory, error: newerStoryError } = await supabase
      .from('short_stories')
      .select('*')
      .eq('report_date', newerDateString)
      .single()

    const { data: olderStory, error: olderStoryError } = await supabase
      .from('short_stories')
      .select('*')
      .eq('report_date', olderDateString)
      .single()

    if (newerStoryError || olderStoryError) {
      const missingStoryDates = []
      if (newerStoryError) missingStoryDates.push(newerDateString)
      if (olderStoryError) missingStoryDates.push(olderDateString)
      
      const errorMsg = `必要な小話が見つかりません: ${missingStoryDates.join(', ')}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    console.log('🤖 2段階Claude APIでブログ生成中...')
    const blogData = await generateBlogPostTwoPhase(newerReport, olderReport)
    
    // idempotency_keyを生成
    const idempotencyKey = `blog-${newerDateString}-${olderDateString}-${Date.now()}`
    
    console.log('💾 Supabaseにブログを保存中...')
    
    // Supabaseにブログを保存
    const { data: newBlog, error: insertError } = await supabase
      .from('blog_posts')
      .insert([{
        title: blogData.title,
        slug: blogData.slug,
        summary: blogData.summary,
        content: blogData.content_md,
        newer_date: newerDateString,
        older_date: olderDateString,
        status: 'published',
        published_at: new Date().toISOString(),
        idempotency_key: idempotencyKey,
        author_id: null,
        original_report_id: newerReport.id,
        tags: ['日報', '脱毛', '障害者専門'],
        excerpt: blogData.summary
      }])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Supabaseブログ保存エラー:', insertError)
      await logMessage('error', 'ブログ保存失敗', { error: insertError?.message || 'Unknown error' })
      return NextResponse.json(
        { error: `ブログ保存失敗: ${insertError?.message || "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ ブログをSupabaseに保存しました:', newBlog.id)
    await logMessage('info', `ブログ生成完了: ${newBlog.title}`, { blogId: newBlog.id })
    
    // ブログ生成後に公開サイトを更新
    console.log('🔄 ブログ生成後の公開サイト更新...')
    // // await revalidateAfterBlogGeneration()
    
    return NextResponse.json(newBlog)
  } catch (error) {
    console.error('ブログ生成エラー:', error)
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error'
    await logMessage('error', 'ブログ生成に失敗しました', { error: errorMessage })
    return NextResponse.json({ error: 'ブログの生成に失敗しました' }, { status: 500 })
  }
}