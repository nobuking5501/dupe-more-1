import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ShortsGenerator } from '@/lib/shorts-generator'
import { ShortsService } from '@/lib/shorts-service'
import { logger } from '@/lib/logger'

// Manual generation endpoint
export async function POST(request: NextRequest) {
  try {
    // Check authentication - temporarily disabled for testing
    // const session = await getServerSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { reportIds } = body

    logger.info('SHORTS_GENERATION', 'Manual generation triggered', { reportIds, userId: 'test-user' })

    let reports = []

    if (reportIds && reportIds.length > 0) {
      // Generate from specific reports
      const { data: specificReports } = await ShortsService.getLatestDailyReports(10)
      reports = specificReports?.filter(r => reportIds.includes(r.id)) || []
    } else {
      // Generate from latest reports
      const { data: latestReports } = await ShortsService.getLatestDailyReports(3)
      reports = latestReports || []
    }

    if (reports.length === 0) {
      return NextResponse.json({ 
        error: 'No reports found for generation' 
      }, { status: 400 })
    }

    // Run the full generation pipeline
    const result = await ShortsGenerator.generateFromReports(reports)

    logger.info('SHORTS_GENERATION', 'Manual generation completed', { 
      shortId: result.shortId,
      status: result.status 
    })

    return NextResponse.json({
      success: true,
      shortId: result.shortId,
      status: result.status,
      message: `Short ${result.status === 'published' ? 'published' : 'created for review'} successfully`
    })

  } catch (error) {
    logger.error('SHORTS_GENERATION', 'Manual generation failed', { error })
    return NextResponse.json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Daily cron generation endpoint
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization (you might want to add a secret header check)
    const cronSecret = request.nextUrl.searchParams.get('secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
    }

    logger.info('SHORTS_CRON', 'Daily cron generation triggered')

    const result = await ShortsGenerator.generateDailyShort()

    logger.info('SHORTS_CRON', 'Daily cron generation completed', { result })

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    logger.error('SHORTS_CRON', 'Daily cron generation failed', { error })
    return NextResponse.json({
      error: 'Daily generation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}