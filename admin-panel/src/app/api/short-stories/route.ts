import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

console.log('=== 管理画面 Firebase設定確認 ===')

export async function GET() {
  try {
    console.log('📥 小話データをFirestoreから取得中...')

    // Firestoreの複合インデックス不要にするため、全件取得してJavaScript側でフィルタ・ソート
    const storiesSnapshot = await adminDb
      .collection('short_stories')
      .get()

    const allStories = storiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }))

    // JavaScript側でフィルタとソート
    const stories = allStories
      .filter((story: any) => story.status === 'active')
      .sort((a: any, b: any) => {
        const dateA = new Date(a.reportDate || a.createdAt || 0).getTime()
        const dateB = new Date(b.reportDate || b.createdAt || 0).getTime()
        return dateB - dateA // 降順
      })

    console.log('✅ 小話取得成功:', stories.length, '件')
    return NextResponse.json(stories)
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
    console.log('📝 小話データを受信')
    const data = await request.json()

    // 入力データ検証
    if (!data.title || !data.content || !data.report_date) {
      console.error('❌ 必須項目が不足しています')
      return NextResponse.json(
        { error: 'タイトル、内容、日付は必須です' },
        { status: 400 }
      )
    }

    // 同じ日付の小話が既に存在するかチェック
    const existingStoriesSnapshot = await adminDb
      .collection('short_stories')
      .where('reportDate', '==', data.report_date)
      .limit(1)
      .get()

    if (!existingStoriesSnapshot.empty) {
      console.log('⚠️ 同じ日付の小話が既に存在します:', data.report_date)
      return NextResponse.json(
        { error: `${data.report_date} の小話は既に存在します` },
        { status: 409 }
      )
    }

    console.log('💾 Firestoreに小話を保存中...')

    // Firestoreに小話を保存（キャメルケースに変換）
    const storyRef = adminDb.collection('short_stories').doc()
    const storyData = {
      title: data.title,
      content: data.content,
      sourceReportId: data.source_report_id,
      reportDate: data.report_date,
      weatherInfo: data.weather_info,
      customerType: data.customer_type,
      keyMoment: data.key_moment,
      emotionalTone: data.emotional_tone || 'heartwarming',
      status: data.status || 'active',
      isFeatured: data.is_featured || false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }

    await storyRef.set(storyData)

    const newStory = {
      id: storyRef.id,
      ...storyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('✅ 小話をFirestoreに保存しました:', newStory.id)
    return NextResponse.json(newStory)
  } catch (error) {
    console.error('小話作成エラー:', error)
    return NextResponse.json({ error: '小話の作成に失敗しました' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    console.log('📝 小話更新データを受信')
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      )
    }

    console.log('💾 Firestoreで小話を更新中...')

    // キャメルケースに変換
    const firestoreUpdateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    }

    // snake_caseフィールドをcamelCaseに変換
    const fieldMap: { [key: string]: string } = {
      'title': 'title',
      'content': 'content',
      'source_report_id': 'sourceReportId',
      'report_date': 'reportDate',
      'weather_info': 'weatherInfo',
      'customer_type': 'customerType',
      'key_moment': 'keyMoment',
      'emotional_tone': 'emotionalTone',
      'status': 'status',
      'is_featured': 'isFeatured'
    }

    Object.keys(updateData).forEach(key => {
      if (key !== 'created_at' && key !== 'updated_at') {
        const camelKey = fieldMap[key] || key
        firestoreUpdateData[camelKey] = updateData[key]
      }
    })

    const storyRef = adminDb.collection('short_stories').doc(id)
    await storyRef.update(firestoreUpdateData)

    // 更新後のデータを取得
    const updatedDoc = await storyRef.get()
    if (!updatedDoc.exists) {
      return NextResponse.json(
        { error: '小話が見つかりません' },
        { status: 404 }
      )
    }

    const updatedStory = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate().toISOString()
    }

    console.log('✅ 小話を更新しました:', updatedStory.id)
    return NextResponse.json(updatedStory)
  } catch (error) {
    console.error('小話更新エラー:', error)
    return NextResponse.json({ error: '小話の更新に失敗しました' }, { status: 500 })
  }
}
