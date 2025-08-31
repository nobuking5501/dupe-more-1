import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 実際の実装ではSupabaseから取得
    // const { data, error } = await supabase
    //   .from('short_stories')
    //   .select('*')
    //   .eq('status', 'active')
    //   .order('created_at', { ascending: false })
    
    // 仮のデータ（フィーチャーされた最新の小話）
    const featuredStory = {
      id: 'story-1',
      title: '初めての安心、二度目の笑顔',
      content: `暖かな春の日差しが差し込むサロンで、初回来店の女子高生のお客様をお迎えしました。最初は少し緊張されていましたが、お母様と一緒ということもあり、だんだんリラックスしていただけました。

施術が始まると「思ったより痛くない」と安心された表情を見せてくださり、最後は鏡で仕上がりを確認して素敵な笑顔を浮かべられました。「また来ます」という言葉と共に、明るい気持ちで帰られる姿を見て、私たちも温かい気持ちになりました。

お一人お一人の「初めての一歩」に寄り添えることは、私たちにとって何よりの喜びです。`,
      report_date: '2024-08-15',
      weather_info: '晴れ 28℃ 暖かく過ごしやすい日',
      customer_type: '10代後半女性・初回来店',
      key_moment: '施術後の安心した笑顔と「また来ます」という言葉',
      emotional_tone: 'heartwarming',
      is_featured: true,
      created_at: '2024-08-15T10:00:00Z'
    }

    return NextResponse.json(featuredStory)
  } catch (error) {
    console.error('小話取得エラー:', error)
    return NextResponse.json({ error: '小話の取得に失敗しました' }, { status: 500 })
  }
}

