import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

console.log('=== 管理画面 Firebase設定確認 ===')

export async function POST(request: Request) {
  try {
    const { date } = await request.json()

    if (!date) {
      return NextResponse.json({ error: '日付は必須です' }, { status: 400 })
    }

    console.log('🗑️ 小話削除リクエスト - 対象日:', date)

    // 削除前に対象レコードを確認
    const storiesSnapshot = await adminDb
      .collection('short_stories')
      .where('reportDate', '==', date)
      .get()

    const existingStories = storiesSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      reportDate: doc.data().reportDate
    }))

    console.log('📊 削除対象:', existingStories)

    if (existingStories.length === 0) {
      return NextResponse.json({ message: '削除対象の小話が見つかりません', deleted: 0 })
    }

    // 削除実行（バッチ処理）
    const batch = adminDb.batch()
    storiesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    await batch.commit()

    console.log('✅ 削除完了 - 削除件数:', existingStories.length)

    return NextResponse.json({
      message: '削除完了',
      deleted: existingStories.length,
      stories: existingStories
    })
  } catch (error) {
    console.error('削除処理エラー:', error)
    return NextResponse.json({ error: '削除処理でエラーが発生しました' }, { status: 500 })
  }
}
