import { NextRequest, NextResponse } from 'next/server'
import { ShortsGenerator } from '@/lib/shorts-generator'
import { logger } from '@/lib/logger'

// Daily cron endpoint for generating shorts at 09:00 JST
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization with secret
    const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
    const expectedSecret = process.env.CRON_SECRET
    
    if (!cronSecret || !expectedSecret || cronSecret !== expectedSecret) {
      logger.log('warn', 'Unauthorized cron request', { 
        hasSecret: !!cronSecret,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current time in JST
    const now = new Date()
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // UTC + 9 hours
    const hour = jstNow.getHours()
    const minute = jstNow.getMinutes()

    logger.log('info', 'Daily cron generation triggered', { 
      jstTime: jstNow.toISOString(),
      hour,
      minute,
      isScheduledTime: hour === 9 && minute < 30 // Allow 30 minute window
    })

    // Optional: Only run during scheduled time window (09:00-09:30 JST)
    // Remove this check if you want to allow manual execution at any time
    if (process.env.NODE_ENV === 'production' && (hour !== 9 || minute >= 30)) {
      logger.log('info', 'Cron called outside scheduled time window', { hour, minute })
      return NextResponse.json({
        message: 'Outside scheduled time window (09:00-09:30 JST)',
        currentTime: jstNow.toISOString()
      })
    }

    const result = await ShortsGenerator.generateDailyShort()

    logger.log('info', 'Daily cron generation completed', { result })

    // Return detailed result for monitoring
    return NextResponse.json({
      success: true,
      timestamp: jstNow.toISOString(),
      ...result,
      nextRun: getNextRunTime()
    })

  } catch (error) {
    logger.log('error', 'Daily cron generation failed', { error })
    
    return NextResponse.json({
      error: 'Daily generation failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Also support POST for manual triggers (with authentication)
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
    const expectedSecret = process.env.CRON_SECRET
    
    if (!cronSecret || !expectedSecret || cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.log('info', 'Manual daily generation triggered via POST')

    const result = await ShortsGenerator.generateDailyShort()

    logger.log('info', 'Manual daily generation completed', { result })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      triggerType: 'manual',
      ...result
    })

  } catch (error) {
    logger.log('error', 'Manual daily generation failed', { error })
    
    return NextResponse.json({
      error: 'Manual generation failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper function to calculate next run time
function getNextRunTime(): string {
  const now = new Date()
  const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // UTC + 9 hours
  
  // Next run is tomorrow at 09:00 JST
  const nextRun = new Date(jstNow)
  nextRun.setDate(nextRun.getDate() + 1)
  nextRun.setHours(9, 0, 0, 0)
  
  return nextRun.toISOString()
}