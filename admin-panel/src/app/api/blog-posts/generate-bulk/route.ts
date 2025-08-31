import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// // import { // revalidateAfterBlogGeneration } from '@/lib/revalidation'
import { callClaudeGenerateBulkAPI } from '@/lib/claude-generate'
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
    const { data: availableReports, error: reportsError } = await supabase
      .from('daily_reports')
      .select('report_date')
      .order('report_date', { ascending: false })
    
    if (reportsError || !availableReports || availableReports.length < 12) {
      const errorMsg = `12記事生成には最低12個の日報が必要です。現在：${availableReports?.length || 0}個`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // 重複を除去して最新12日分を取得
    const uniqueDates = new Set(availableReports.map(r => r.report_date))
    const availableDates = Array.from(uniqueDates)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 12)
    
    console.log('📅 対象日付リスト（12日分）:', availableDates)
    
    // 12日誌を6ペアに分割
    const reportPairs = []
    for (let i = 0; i < availableDates.length; i += 2) {
      if (i + 1 < availableDates.length) {
        const newerDate = availableDates[i]
        const olderDate = availableDates[i + 1]
        
        // 各日付の日報データを取得
        const { data: newerReports } = await supabase
          .from('daily_reports')
          .select('*')
          .eq('report_date', newerDate)
          .limit(1)
        
        const { data: olderReports } = await supabase
          .from('daily_reports')
          .select('*')
          .eq('report_date', olderDate)
          .limit(1)
        
        if (newerReports?.[0] && olderReports?.[0]) {
          reportPairs.push({
            newer: newerReports[0],
            older: olderReports[0]
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
        newer_date: pair.newer.report_date,
        older_date: pair.older.report_date,
        original_report_id: pair.newer.id,
        diagnostics: {
          ...blog.diagnostics,
          linewrap_ok: true
        }
      })
    }
    
    console.log('✅ 清書フェーズ完了。Supabase保存開始...')
    
    // Supabaseに一括保存
    const savedBlogs = []
    for (let i = 0; i < finalBlogs.length; i++) {
      const blogData = finalBlogs[i]
      const idempotencyKey = `bulk-blog-${blogData.newer_date}-${blogData.older_date}-${Date.now()}`
      
      // 既存ブログの重複チェック
      const { data: existingBlog } = await supabase
        .from('blog_posts')
        .select('id, title')
        .eq('newer_date', blogData.newer_date)
        .eq('older_date', blogData.older_date)
        .single()
      
      if (existingBlog) {
        console.log(`⚠️ スキップ（既存）: ${existingBlog.title}`)
        savedBlogs.push(existingBlog)
        continue
      }
      
      const { data: newBlog, error: insertError } = await supabase
        .from('blog_posts')
        .insert([{
          title: blogData.title,
          slug: blogData.slug,
          summary: blogData.summary,
          content: blogData.content_md,
          newer_date: blogData.newer_date,
          older_date: blogData.older_date,
          status: 'published',
          published_at: new Date().toISOString(),
          idempotency_key: idempotencyKey,
          author_id: null,
          original_report_id: blogData.original_report_id,
          tags: ['日報', '脱毛', '障害者専門'],
          excerpt: blogData.summary
        }])
        .select()
        .single()

      if (insertError) {
        console.error('❌ 保存エラー:', insertError)
        await logMessage('error', `ブログ保存失敗: ${blogData.title}`, { error: insertError?.message || "Unknown error" })
        continue
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
    // // await revalidateAfterBlogGeneration()
    
    return NextResponse.json({
      success: true,
      generated_count: savedBlogs.length,
      blogs: savedBlogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        newer_date: blog.newer_date,
        older_date: blog.older_date
      }))
    })
    
  } catch (error) {
    console.error('一括ブログ生成エラー:', error)
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error'
    await logMessage('error', '一括ブログ生成に失敗しました', { error: errorMessage })
    return NextResponse.json({ 
      error: '一括ブログ生成に失敗しました',
      details: errorMessage 
    }, { status: 500 })
  }
}