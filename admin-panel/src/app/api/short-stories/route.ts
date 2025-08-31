import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアント設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    console.log('📥 小話データをSupabaseから取得中...')
    
    const { data: stories, error } = await supabase
      .from('short_stories')
      .select('*')
      .eq('status', 'active')
      .order('report_date', { ascending: false })

    if (error) {
      console.error('❌ 小話取得エラー:', error)
      return NextResponse.json(
        { error: `小話取得失敗: ${error instanceof Error ? error.message : "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ 小話取得成功:', stories?.length || 0, '件')
    return NextResponse.json(stories || [])
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
    const { data: existingStory, error: checkError } = await supabase
      .from('short_stories')
      .select('id, report_date')
      .eq('report_date', data.report_date)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 小話重複チェックエラー:', checkError)
      return NextResponse.json(
        { error: '小話の重複チェックに失敗しました' }, 
        { status: 500 }
      )
    }

    if (existingStory) {
      console.log('⚠️ 同じ日付の小話が既に存在します:', data.report_date)
      return NextResponse.json(
        { error: `${data.report_date} の小話は既に存在します` }, 
        { status: 409 }
      )
    }

    console.log('💾 Supabaseに小話を保存中...')
    
    // Supabaseに小話を保存
    const { data: newStory, error: insertError } = await supabase
      .from('short_stories')
      .insert([{
        title: data.title,
        content: data.content,
        source_report_id: data.source_report_id,
        report_date: data.report_date,
        weather_info: data.weather_info,
        customer_type: data.customer_type,
        key_moment: data.key_moment,
        emotional_tone: data.emotional_tone || 'heartwarming',
        status: data.status || 'active',
        is_featured: data.is_featured || false
      }])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Supabase小話保存エラー:', insertError)
      return NextResponse.json(
        { error: `小話保存失敗: ${insertError?.message || "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ 小話をSupabaseに保存しました:', newStory.id)
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

    console.log('💾 Supabaseで小話を更新中...')
    
    const { data: updatedStory, error } = await supabase
      .from('short_stories')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ 小話更新エラー:', error)
      return NextResponse.json(
        { error: `小話更新失敗: ${error instanceof Error ? error.message : "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ 小話を更新しました:', updatedStory.id)
    return NextResponse.json(updatedStory)
  } catch (error) {
    console.error('小話更新エラー:', error)
    return NextResponse.json({ error: '小話の更新に失敗しました' }, { status: 500 })
  }
}