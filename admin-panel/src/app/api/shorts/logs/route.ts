import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ShortsService } from '@/lib/shorts-service'
import { logger } from '@/lib/logger'

// Get generation logs with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shortId = searchParams.get('shortId')
    const stage = searchParams.get('stage')
    const status = searchParams.get('status')

    logger.log('info', 'Fetching generation logs', { 
      shortId, 
      stage, 
      status, 
      userId: session.user?.email 
    })

    const { data: logs, error } = await ShortsService.getGenerationLogs(shortId || undefined)

    if (error) {
      logger.log('error', 'Failed to fetch generation logs', { error })
      return NextResponse.json({ 
        error: 'Failed to fetch logs',
        details: error.message || String(error)
      }, { status: 500 })
    }

    // Apply additional filtering if needed
    let filteredLogs = logs || []
    
    if (stage) {
      filteredLogs = filteredLogs.filter(log => log.stage === stage)
    }
    
    if (status) {
      filteredLogs = filteredLogs.filter(log => log.status === status)
    }

    // Calculate summary statistics
    const summary = {
      total: filteredLogs.length,
      success: filteredLogs.filter(log => log.status === 'success').length,
      error: filteredLogs.filter(log => log.status === 'error').length,
      retry: filteredLogs.filter(log => log.status === 'retry').length,
      stages: {
        sanitize: filteredLogs.filter(log => log.stage === 'sanitize').length,
        draft: filteredLogs.filter(log => log.stage === 'draft').length,
        audit: filteredLogs.filter(log => log.stage === 'audit').length,
        publish: filteredLogs.filter(log => log.stage === 'publish').length
      },
      averageElapsedMs: filteredLogs.length > 0 
        ? Math.round(filteredLogs.reduce((sum, log) => sum + (log.elapsed_ms || 0), 0) / filteredLogs.length)
        : 0
    }

    return NextResponse.json({
      success: true,
      data: filteredLogs,
      summary,
      count: filteredLogs.length
    })

  } catch (error) {
    logger.log('error', 'Generation logs API error', { error })
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}