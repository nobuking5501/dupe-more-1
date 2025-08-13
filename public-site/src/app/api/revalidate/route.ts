import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Verify revalidation secret
    const secret = request.headers.get('authorization')?.replace('Bearer ', '')
    const expectedSecret = process.env.REVALIDATE_SECRET
    
    if (!secret || !expectedSecret || secret !== expectedSecret) {
      console.warn('Unauthorized revalidation request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paths, tags, type } = body

    console.log('ISR revalidation triggered', { paths, tags, type })

    // Default revalidation for shorts-related content
    const defaultPaths = [
      '/', // Homepage (includes shorts-today section)
      '/shorts', // Shorts listing page
      '/sitemap.xml' // Sitemap
    ]

    const pathsToRevalidate = paths || defaultPaths

    // Revalidate specified paths
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path)
        console.log(`Revalidated path: ${path}`)
      } catch (error) {
        console.error(`Failed to revalidate path ${path}:`, error)
      }
    }

    // Revalidate specified tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        try {
          revalidateTag(tag)
          console.log(`Revalidated tag: ${tag}`)
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error)
        }
      }
    }

    const response = {
      revalidated: true,
      timestamp: new Date().toISOString(),
      paths: pathsToRevalidate,
      tags: tags || [],
      type: type || 'shorts'
    }

    console.log('ISR revalidation completed', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('ISR revalidation error:', error)
    
    return NextResponse.json({
      error: 'Revalidation failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const path = searchParams.get('path') || '/'
  
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    revalidatePath(path)
    
    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to revalidate',
      path,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}