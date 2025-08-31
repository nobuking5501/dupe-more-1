import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== ヘルスチェック開始 ===')
  
  try {
    // 環境変数チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const claudeKey = process.env.ANTHROPIC_API_KEY
    
    console.log('環境変数確認:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 設定済み' : '❌ 未設定')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ 設定済み' : '❌ 未設定')
    console.log('- ANTHROPIC_API_KEY:', claudeKey ? '✅ 設定済み' : '❌ 未設定')
    
    const result = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: supabaseUrl ? 'configured' : 'missing',
        supabaseKey: supabaseKey ? 'configured' : 'missing',
        claudeKey: claudeKey ? 'configured' : 'missing'
      },
      process: {
        nodeVersion: process.version,
        platform: process.platform
      }
    }
    
    console.log('ヘルスチェック成功:', result)
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('ヘルスチェックエラー:', error)
    return NextResponse.json(
      { 
        status: 'ERROR', 
        error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}