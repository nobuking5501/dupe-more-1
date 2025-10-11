import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET() {
  try {
    // Firestoreから最新の小話を取得（isFeatured=trueを優先）
    const storiesSnapshot = await adminDb
      .collection('short_stories')
      .where('status', '==', 'active')
      .orderBy('isFeatured', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()

    const stories = storiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }))

    // ShortsToday用の形式に変換（snake_caseに）
    const formattedShorts = stories.map(story => ({
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
