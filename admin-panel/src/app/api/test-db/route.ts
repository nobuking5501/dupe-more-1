import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアント設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

export async function GET() {
  try {
    console.log('=== データベーステスト開始 ===')
    
    const tests = []
    
    // 1. daily_reports テーブル存在確認
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('count')
        .limit(1)
        
      tests.push({
        test: 'daily_reports テーブル',
        status: error ? 'エラー' : '正常',
        error: error?.message || null
      })
    } catch (e) {
      tests.push({
        test: 'daily_reports テーブル',
        status: 'エラー',
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }
    
    // 2. short_stories テーブル存在確認
    try {
      const { data, error } = await supabase
        .from('short_stories')
        .select('count')
        .limit(1)
        
      tests.push({
        test: 'short_stories テーブル',
        status: error ? 'エラー' : '正常',
        error: error?.message || null
      })
    } catch (e) {
      tests.push({
        test: 'short_stories テーブル',
        status: 'エラー',
        error: e instanceof Error ? e.message : "Unknown error"
      })
    }
    
    // 3. サンプルデータ確認
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .limit(5)
        
      tests.push({
        test: 'daily_reports データ',
        status: error ? 'エラー' : '正常',
        count: data?.length || 0,
        error: error?.message || null
      })
    } catch (e) {
      tests.push({
        test: 'daily_reports データ',
        status: 'エラー',
        error: e instanceof Error ? e.message : "Unknown error"
      })
    }
    
    // 4. 小話データ確認
    try {
      const { data, error } = await supabase
        .from('short_stories')
        .select('*')
        .limit(5)
        
      tests.push({
        test: 'short_stories データ',
        status: error ? 'エラー' : '正常',
        count: data?.length || 0,
        error: error?.message || null
      })
    } catch (e) {
      tests.push({
        test: 'short_stories データ',
        status: 'エラー',
        error: e instanceof Error ? e.message : "Unknown error"
      })
    }
    
    console.log('=== テスト結果 ===')
    tests.forEach(test => {
      console.log(`${test.test}: ${test.status}`)
      if (test.error) console.log(`  エラー: ${test.error}`)
      if (test.count !== undefined) console.log(`  データ件数: ${test.count}`)
    })
    
    return NextResponse.json({
      message: 'データベーステスト完了',
      tests: tests,
      environment: {
        supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'なし',
        supabaseKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'なし'
      }
    })
    
  } catch (error) {
    console.error('テストエラー:', error)
    return NextResponse.json(
      { error: `テスト実行エラー: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}