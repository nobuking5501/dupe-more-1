import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return NextResponse.json({ error: 'ブログ記事が見つかりません' }, { status: 404 })
    }

    // データを既存のフォーマットに変換
    const formattedData = {
      ...data,
      published: data.status === 'published',
      staff: { name: data.author_name }
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Service error:', error)
    return NextResponse.json({ error: 'ブログ記事の取得に失敗しました' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const data = await request.json()
    
    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: 'ブログ記事の更新に失敗しました' }, { status: 500 })
    }
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Service error:', error)
    return NextResponse.json({ error: 'ブログ記事の更新に失敗しました' }, { status: 500 })
  }
}