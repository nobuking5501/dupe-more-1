import { NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-client'

export async function GET() {
  try {
    const result = await SupabaseService.getPublishedOwnerMessages()
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to fetch owner messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: result.data,
      count: result.data?.length || 0
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}