import { NextRequest, NextResponse } from 'next/server'
import { ShortsGenerator } from '@/lib/shorts-generator'
import { logger } from '@/lib/logger'

// Webhook endpoint for daily report saves
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (for security)
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      logger.log('warn', 'Unauthorized webhook request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, table, record } = body

    // Only process daily_reports insertions
    if (type !== 'INSERT' || table !== 'daily_reports') {
      logger.log('info', 'Webhook ignored - not a daily report insertion', { type, table })
      return NextResponse.json({ message: 'Webhook ignored' })
    }

    logger.log('info', 'Daily report webhook triggered', { reportId: record?.id })

    // Trigger automatic generation (but don't wait for completion)
    // This runs in the background to avoid blocking the webhook response
    ShortsGenerator.generateDailyShort()
      .then(result => {
        logger.log('info', 'Webhook-triggered generation completed', { result })
      })
      .catch(error => {
        logger.log('error', 'Webhook-triggered generation failed', { error })
      })

    // Return immediate success to avoid webhook timeout
    return NextResponse.json({ 
      success: true, 
      message: 'Generation triggered' 
    })

  } catch (error) {
    logger.log('error', 'Webhook processing failed', { error })
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}