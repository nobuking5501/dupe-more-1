import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ShortsService } from '@/lib/shorts-service'
import { logger } from '@/lib/logger'

// Get shorts (with optional status filter)
export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin endpoints
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'draft' | 'pending_review' | 'published' | null

    logger.log('info', 'Fetching shorts', { status, userId: session.user?.email })

    const { data: shorts, error } = await ShortsService.getShorts(status || undefined)

    if (error) {
      logger.log('error', 'Failed to fetch shorts', { error })
      return NextResponse.json({ 
        error: 'Failed to fetch shorts',
        details: error.message || String(error)
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: shorts,
      count: shorts?.length || 0
    })

  } catch (error) {
    logger.log('error', 'Shorts API error', { error })
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}