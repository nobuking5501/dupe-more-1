import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('daily_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(limit)

    if (startDate) {
      query = query.gte('report_date', startDate)
    }

    if (endDate) {
      query = query.lte('report_date', endDate)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Error fetching daily reports:', error)
      return NextResponse.json(
        { error: '日報の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reports || []
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      staff_name,
      report_date,
      client_interactions,
      observations,
      challenges,
      successes,
      improvements,
      feelings
    } = body

    if (!staff_name || !report_date) {
      return NextResponse.json(
        { error: 'スタッフ名と報告日は必須です' },
        { status: 400 }
      )
    }

    const { data: report, error } = await supabase
      .from('daily_reports')
      .insert({
        staff_name,
        report_date,
        client_interactions,
        observations,
        challenges,
        successes,
        improvements,
        feelings
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating daily report:', error)
      return NextResponse.json(
        { error: '日報の作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    )
  }
}