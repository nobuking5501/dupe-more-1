import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('📥 エージェントログを取得中...')
    
    let query = supabase
      .from('agent_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (level) {
      query = query.eq('level', level)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('❌ ログ取得エラー:', error)
      return NextResponse.json(
        { error: `ログ取得失敗: ${error instanceof Error ? error.message : "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ ログ取得成功:', logs?.length || 0, '件')
    return NextResponse.json(logs || [])
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
    const data = await request.json()
    
    console.log('📝 ログデータを受信')
    
    // 入力データ検証
    if (!data.level || !data.message) {
      return NextResponse.json(
        { error: 'levelとmessageは必須です' }, 
        { status: 400 }
      )
    }

    if (!['info', 'warn', 'error'].includes(data.level)) {
      return NextResponse.json(
        { error: 'levelは info, warn, error のいずれかである必要があります' }, 
        { status: 400 }
      )
    }

    console.log('💾 Supabaseにログを保存中...')
    
    const { data: newLog, error: insertError } = await supabase
      .from('agent_logs')
      .insert([{
        level: data.level,
        message: data.message,
        context: data.context || {}
      }])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Supabaseログ保存エラー:', insertError)
      return NextResponse.json(
        { error: `ログ保存失敗: ${insertError?.message || "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ ログをSupabaseに保存しました:', newLog.id)
    return NextResponse.json(newLog)
  } catch (error) {
    console.error('ログ作成エラー:', error)
    return NextResponse.json({ error: 'ログの作成に失敗しました' }, { status: 500 })
  }
}