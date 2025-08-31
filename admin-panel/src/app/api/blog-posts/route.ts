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
    console.log('📝 ブログ記事一覧取得リクエスト')
    
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ ブログ記事取得エラー:', error)
      return NextResponse.json({ error: 'ブログ記事の取得に失敗しました' }, { status: 500 })
    }

    console.log('✅ ブログ記事取得成功:', blogPosts?.length || 0, '件')
    return NextResponse.json(blogPosts || [])
  } catch (error) {
    console.error('ブログ記事取得エラー:', error)
    return NextResponse.json({ error: 'ブログ記事の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    console.log('📝 ブログ記事作成リクエスト')
    
    const newPost = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'published',
      published_at: new Date().toISOString()
    }
    
    const { data: insertedPost, error } = await supabase
      .from('blog_posts')
      .insert([newPost])
      .select()
      .single()

    if (error) {
      console.error('❌ ブログ記事作成エラー:', error)
      return NextResponse.json({ error: 'ブログ記事の作成に失敗しました' }, { status: 500 })
    }

    console.log('✅ ブログ記事作成成功:', insertedPost.id)
    return NextResponse.json(insertedPost)
  } catch (error) {
    console.error('ブログ記事作成エラー:', error)
    return NextResponse.json({ error: 'ブログ記事の作成に失敗しました' }, { status: 500 })
  }
}