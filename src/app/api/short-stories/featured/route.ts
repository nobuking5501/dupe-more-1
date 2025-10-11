import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET() {
  try {
    console.log('📝 フィーチャー小話取得開始')

    // Firestoreから最新のactive小話を取得（statusフィルターのみ、インデックス不要）
    const storiesSnapshot = await adminDb
      .collection('short_stories')
      .where('status', '==', 'active')
      .get()

    if (storiesSnapshot.empty) {
      console.log('⚠️ フィーチャー小話が見つかりません')
      return NextResponse.json(
        { error: 'フィーチャー小話が見つかりません' },
        { status: 404 }
      )
    }

    // JavaScriptでソートして最新の1件を取得
    const stories = storiesSnapshot.docs.map(doc => ({
      doc: doc,
      createdAt: doc.data().createdAt?.toDate().getTime() || 0
    }))

    stories.sort((a, b) => b.createdAt - a.createdAt)

    const doc = stories[0].doc
    const docData = doc.data()

    const featuredStory = {
      id: doc.id,
      title: docData.title,
      content: docData.content,
      reportDate: docData.reportDate,
      weatherInfo: docData.weatherInfo,
      customerType: docData.customerType,
      keyMoment: docData.keyMoment,
      emotionalTone: docData.emotionalTone,
      isFeatured: docData.isFeatured,
      createdAt: docData.createdAt?.toDate().toISOString(),
      updatedAt: docData.updatedAt?.toDate().toISOString()
    }

    console.log('✅ フィーチャー小話取得成功:', featuredStory.title)
    return NextResponse.json(featuredStory)
  } catch (error) {
    console.error('❌ フィーチャー小話取得エラー:', error)
    return NextResponse.json(
      { error: 'フィーチャー小話の取得に失敗しました' },
      { status: 500 }
    )
  }
}
