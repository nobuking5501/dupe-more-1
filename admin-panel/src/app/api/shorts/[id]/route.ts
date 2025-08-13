import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ShortsService } from '@/lib/shorts-service'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: { id: string }
}

// Update short status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!['draft', 'pending_review', 'published'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status',
        details: 'Status must be one of: draft, pending_review, published'
      }, { status: 400 })
    }

    logger.log('info', 'Updating short status', { 
      shortId: id, 
      newStatus: status, 
      userId: session.user?.email 
    })

    const publishedAt = status === 'published' ? new Date().toISOString() : undefined

    const { data: updatedShort, error } = await ShortsService.updateShortStatus(
      id, 
      status,
      publishedAt
    )

    if (error) {
      logger.log('error', 'Failed to update short status', { error, shortId: id })
      return NextResponse.json({ 
        error: 'Failed to update short',
        details: error.message || String(error)
      }, { status: 500 })
    }

    // Log the status change for audit trail
    await ShortsService.logGeneration({
      short_id: id,
      stage: 'publish',
      status: 'success',
      output_data: { 
        action: 'status_update',
        newStatus: status,
        updatedBy: session.user?.email
      },
      metadata: { manual_update: true }
    })

    // Trigger ISR revalidation if published
    if (status === 'published') {
      try {
        const revalidateUrl = process.env.NEXT_PUBLIC_SITE_URL + '/api/revalidate'
        const revalidateSecret = process.env.REVALIDATE_SECRET
        
        if (revalidateUrl && revalidateSecret) {
          const revalidateResponse = await fetch(revalidateUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${revalidateSecret}`
            },
            body: JSON.stringify({
              type: 'short_published',
              paths: ['/', '/shorts', '/sitemap.xml']
            })
          })
          
          if (revalidateResponse.ok) {
            logger.log('info', 'ISR revalidation triggered successfully', { shortId: id })
          } else {
            logger.log('warn', 'ISR revalidation failed', { 
              shortId: id, 
              status: revalidateResponse.status 
            })
          }
        }
      } catch (error) {
        logger.log('error', 'ISR revalidation error', { shortId: id, error })
        // Don't fail the main operation if revalidation fails
      }
    }

    logger.log('info', 'Short status updated successfully', { 
      shortId: id, 
      newStatus: status 
    })

    return NextResponse.json({
      success: true,
      data: updatedShort,
      message: `Short ${status === 'published' ? 'published' : `moved to ${status}`} successfully`
    })

  } catch (error) {
    logger.log('error', 'Short update API error', { error, shortId: params.id })
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Get single short with generation logs
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get the short and its generation logs
    const [shortsResult, logsResult] = await Promise.all([
      ShortsService.getShorts(),
      ShortsService.getGenerationLogs(id)
    ])

    const short = shortsResult.data?.find(s => s.id === id)
    if (!short) {
      return NextResponse.json({ error: 'Short not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        short,
        logs: logsResult.data || []
      }
    })

  } catch (error) {
    logger.log('error', 'Short detail API error', { error, shortId: params.id })
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}