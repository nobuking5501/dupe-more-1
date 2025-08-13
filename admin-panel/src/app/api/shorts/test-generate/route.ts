import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting test shorts generation ===')
    
    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase admin client not available',
        message: 'Please check SUPABASE_SERVICE_ROLE_KEY environment variable'
      }, { status: 500 })
    }

    // 1. Get recent daily reports from Supabase
    console.log('Fetching daily reports from Supabase...')
    const { data: reports, error: reportsError } = await supabaseAdmin
      .from('daily_reports')
      .select('id, title, content, date, created_at')
      .order('date', { ascending: false })
      .limit(3)
    
    if (reportsError) {
      console.error('Failed to fetch daily reports:', reportsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch daily reports',
        details: reportsError.message
      }, { status: 500 })
    }

    console.log(`Found ${reports?.length || 0} daily reports`)
    
    if (!reports || reports.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No daily reports found',
        message: 'Please create some daily reports first'
      }, { status: 400 })
    }

    // 2. Generate a simple short story using mock data for now
    const mockShort = {
      title: 'テスト小話：心温まるひととき',
      body_md: `今日、サロンでとても素敵な出来事がありました。

初めてご来店いただいたお子さまが、最初は少し緊張されていましたが、スタッフとの会話を通じて徐々にリラックスされている様子でした。

お母さまからは「こんなに落ち着いて施術を受けられるなんて思わなかった」とのお言葉をいただき、私たちも嬉しい気持ちでいっぱいになりました。

一人ひとりのお子さまに合わせたケアを心がけている私たちにとって、このような瞬間がとても大切です。`,
      tags: ['やさしさ', '安心', '配慮'],
      status: 'pending_review',
      pii_risk_score: 15,
      source_report_ids: reports.map(r => r.id)
    }

    // 3. Save to Supabase shorts table
    console.log('Saving generated short to database...')
    const { data: short, error: insertError } = await supabaseAdmin
      .from('shorts')
      .insert([mockShort])
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save short:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save short',
        details: insertError.message
      }, { status: 500 })
    }

    console.log('Short saved successfully:', short.id)

    // 4. Log the generation
    await supabaseAdmin
      .from('generation_logs')
      .insert([{
        short_id: short.id,
        stage: 'test_generate',
        status: 'success',
        elapsed_ms: 1000,
        model_name: 'mock-test',
        input_data: { reportCount: reports.length },
        output_data: { shortId: short.id }
      }])

    return NextResponse.json({
      success: true,
      message: 'Test short generated successfully',
      data: {
        shortId: short.id,
        title: short.title,
        status: short.status,
        reportsUsed: reports.length
      }
    })

  } catch (error) {
    console.error('Test generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}