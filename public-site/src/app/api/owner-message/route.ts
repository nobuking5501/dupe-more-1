import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearMonth = searchParams.get('year_month');
    const limit = parseInt(searchParams.get('limit') || '12');

    const supabase = createSupabaseClient();
    
    let query = supabase
      .from('owner_messages')
      .select('id, year_month, title, body_md, highlights, published_at')
      .eq('status', 'published')
      .order('year_month', { ascending: false })
      .limit(limit);

    // 特定の年月を指定した場合
    if (yearMonth) {
      query = query.eq('year_month', yearMonth);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('オーナーメッセージ取得エラー:', error);
      return NextResponse.json(
        { error: 'オーナーメッセージの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: messages || []
    });

  } catch (error) {
    console.error('オーナーメッセージAPI エラー:', error);
    return NextResponse.json(
      { error: 'オーナーメッセージの取得に失敗しました' },
      { status: 500 }
    );
  }
}