import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    // Supabaseから最新の小話を取得（is_featured=trueを優先）
    const { data: stories, error } = await supabase
      .from('short_stories')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Supabase小話取得エラー:', error)
      return NextResponse.json({ error: '小話の取得に失敗しました' }, { status: 500 })
    }

    // ShortsToday用の形式に変換
    const formattedShorts = stories.map(story => ({
      id: story.id,
      title: story.title,
      body_md: story.content,
      tags: [story.emotional_tone],
      status: 'published',
      pii_risk_score: 0,
      source_report_ids: [story.source_report_id],
      created_at: story.created_at,
      published_at: story.created_at,
      updated_at: story.updated_at || story.created_at
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