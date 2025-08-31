import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaudeGenerateAPI } from '@/lib/claude-generate'
import { callClaudeCleanAPI } from '@/lib/claude-clean'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function generateBlogPostTwoPhase(newerReport: any, olderReport: any) {
  console.log('メインサイト - 2段階ブログ生成開始')
  
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
    console.error('メインサイト - 2段階ブログ生成エラー:', error)
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
    console.log('📝 メインサイト - ブログ生成テストリクエスト受信')
    
    // 利用可能な日報から最新2件を取得
    const { data: availableReports, error: reportsError } = await supabase
      .from('daily_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(2)
    
    if (reportsError || !availableReports || availableReports.length < 2) {
      return NextResponse.json({ 
        error: `ブログ生成にはまきものが必要です。現在：${availableReports?.length || 0}件` 
      }, { status: 400 })
    }

    const newerReport = availableReports[0]
    const olderReport = availableReports[1]
    
    console.log('🤖 メインサイト - 2段階Claude APIでブログ生成中...')
    const blogData = await generateBlogPostTwoPhase(newerReport, olderReport)
    
    console.log('✅ メインサイト - ブログ生成完了:', blogData.title)
    
    return NextResponse.json({
      success: true,
      blog: blogData,
      message: 'メインサイトでのブログ生成テスト完了'
    })
    
  } catch (error) {
    console.error('メインサイト - ブログ生成エラー:', error)
    return NextResponse.json({ 
      error: 'メインサイト - ブログの生成に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}