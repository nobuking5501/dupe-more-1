import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== ヘルスチェック開始 ===')
  
  try {
    // 環境変数チェック
    const firebaseProjectId = process.env.FIREBASE_PROJECT_ID
    const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY
    const claudeKey = process.env.ANTHROPIC_API_KEY

    console.log('環境変数確認:')
    console.log('- FIREBASE_PROJECT_ID:', firebaseProjectId ? '✅ 設定済み' : '❌ 未設定')
    console.log('- FIREBASE_CLIENT_EMAIL:', firebaseClientEmail ? '✅ 設定済み' : '❌ 未設定')
    console.log('- FIREBASE_PRIVATE_KEY:', firebasePrivateKey ? '✅ 設定済み' : '❌ 未設定')
    console.log('- ANTHROPIC_API_KEY:', claudeKey ? '✅ 設定済み' : '❌ 未設定')

    const result = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        firebaseProjectId: firebaseProjectId ? 'configured' : 'missing',
        firebaseClientEmail: firebaseClientEmail ? 'configured' : 'missing',
        firebasePrivateKey: firebasePrivateKey ? 'configured' : 'missing',
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