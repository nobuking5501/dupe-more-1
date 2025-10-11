import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET() {
  try {
    // Firestoreから最新の小話を取得（statusフィルターのみ、インデックス不要）
    const storiesSnapshot = await adminDb
      .collection('short_stories')
      .where('status', '==', 'active')
      .get()

    // JavaScriptでソート（isFeatured優先、次にcreatedAt降順）
    const allStories = storiesSnapshot.docs.map(doc => {
      const data = doc.data() as any
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        _createdAt: data.createdAt?.toDate().getTime() || 0,
        _isFeatured: data.isFeatured ? 1 : 0
      }
    })

    allStories.sort((a: any, b: any) => {
      if (b._isFeatured !== a._isFeatured) {
        return b._isFeatured - a._isFeatured
      }
      return b._createdAt - a._createdAt
    })

    const stories = allStories.slice(0, 5)

    // ShortsToday用の形式に変換（snake_caseに）
    const formattedShorts = stories.map((story: any) => ({
      id: story.id,
      title: story.title,
      body_md: story.content,
      tags: [story.emotionalTone],
      status: 'published',
      pii_risk_score: 0,
      source_report_ids: [story.sourceReportId],
      created_at: story.createdAt,
      published_at: story.createdAt,
      updated_at: story.updatedAt || story.createdAt
    }))

    console.log('Admin shorts returned:', formattedShorts.length, 'items')
    return NextResponse.json(formattedShorts)
  } catch (error) {
    console.error('Admin shorts取得エラー:', error)
    return NextResponse.json({ error: '小話の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('⚠️ このAPIは非推奨です。管理画面の /api/short-stories/generate を使用してください')
    return NextResponse.json({ error: 'このAPIは非推奨です' }, { status: 410 })
  } catch (error) {
    console.error('Admin shorts保存エラー:', error)
    return NextResponse.json({ error: '小話の保存に失敗しました' }, { status: 500 })
  }
}
