import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json({ error: 'ブログ記事の取得に失敗しました' }, { status: 500 })
    }

    // データを既存のフォーマットに変換
    const formattedData = data?.map(post => ({
      ...post,
      published: post.status === 'published',
      staff: { name: 'かなえ' }, // Default staff name
      excerpt: post.summary || post.excerpt || (post.content ? post.content.slice(0, 200) + '...' : ''),
      content: post.content // Make sure content is available for blog detail page
    })) || []

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Service error:', error)
    return NextResponse.json({ error: 'ブログ記事の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert([data])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json({ error: 'ブログ記事の作成に失敗しました' }, { status: 500 })
    }
    
    return NextResponse.json(newPost)
  } catch (error) {
    console.error('Service error:', error)
    return NextResponse.json({ error: 'ブログ記事の作成に失敗しました' }, { status: 500 })
  }
}