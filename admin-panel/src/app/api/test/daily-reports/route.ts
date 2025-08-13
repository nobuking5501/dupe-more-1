import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET() {
  try {
    console.log('=== Testing daily reports fetch ===')
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase admin client not available',
        message: 'Please check SUPABASE_SERVICE_ROLE_KEY environment variable'
      }, { status: 500 })
    }

    // Fetch daily reports
    console.log('Fetching daily reports...')
    const { data: reports, error } = await supabaseAdmin
      .from('daily_reports')
      .select('id, title, content, date, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch reports',
        details: error.message
      }, { status: 500 })
    }

    console.log(`Found ${reports?.length || 0} reports`)
    
    return NextResponse.json({
      success: true,
      count: reports?.length || 0,
      reports: reports || []
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}