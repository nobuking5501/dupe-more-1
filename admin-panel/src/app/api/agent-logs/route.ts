import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

console.log('=== 管理画面 Firebase設定確認 ===')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('📥 エージェントログを取得中...')

    let query = adminDb
      .collection('agent_logs')
      .orderBy('createdAt', 'desc')
      .limit(limit)

    if (level) {
      query = query.where('level', '==', level)
    }

    const logsSnapshot = await query.get()

    const logs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }))

    console.log('✅ ログ取得成功:', logs.length, '件')
    return NextResponse.json(logs)
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    console.log('📝 ログデータを受信')

    // 入力データ検証
    if (!data.level || !data.message) {
      return NextResponse.json(
        { error: 'levelとmessageは必須です' },
        { status: 400 }
      )
    }

    if (!['info', 'warn', 'error'].includes(data.level)) {
      return NextResponse.json(
        { error: 'levelは info, warn, error のいずれかである必要があります' },
        { status: 400 }
      )
    }

    console.log('💾 Firestoreにログを保存中...')

    const logRef = adminDb.collection('agent_logs').doc()
    const logData = {
      level: data.level,
      message: data.message,
      context: data.context || {},
      createdAt: FieldValue.serverTimestamp()
    }

    await logRef.set(logData)

    const newLog = {
      id: logRef.id,
      ...logData,
      createdAt: new Date().toISOString()
    }

    console.log('✅ ログをFirestoreに保存しました:', newLog.id)
    return NextResponse.json(newLog)
  } catch (error) {
    console.error('ログ作成エラー:', error)
    return NextResponse.json({ error: 'ログの作成に失敗しました' }, { status: 500 })
  }
}
