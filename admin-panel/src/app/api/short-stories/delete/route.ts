import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  try {
    const { date } = await request.json()
    
    if (!date) {
      return NextResponse.json({ error: '日付は必須です' }, { status: 400 })
    }

    console.log('🗑️ 小話削除リクエスト - 対象日:', date)

    // 削除前に対象レコードを確認
    const { data: existingStories, error: selectError } = await supabase
      .from('short_stories')
      .select('id, title, report_date')
      .eq('report_date', date)

    if (selectError) {
      console.error('❌ 対象レコード確認エラー:', selectError)
      return NextResponse.json({ error: '対象レコードの確認に失敗しました' }, { status: 500 })
    }

    console.log('📊 削除対象:', existingStories)

    if (!existingStories || existingStories.length === 0) {
      return NextResponse.json({ message: '削除対象の小話が見つかりません', deleted: 0 })
    }

    // 削除実行
    const { error: deleteError } = await supabase
      .from('short_stories')
      .delete()
      .eq('report_date', date)

    if (deleteError) {
      console.error('❌ 削除エラー:', deleteError)
      return NextResponse.json({ error: `削除に失敗しました: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}` }, { status: 500 })
    }

    console.log('✅ 削除完了 - 削除件数:', existingStories.length)
    
    return NextResponse.json({ 
      message: '削除完了', 
      deleted: existingStories.length,
      stories: existingStories 
    })
  } catch (error) {
    console.error('削除処理エラー:', error)
    return NextResponse.json({ error: '削除処理でエラーが発生しました' }, { status: 500 })
  }
}