import { NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
// import { revalidatePublicSite } from '@/lib/revalidation'

export async function POST(request: Request) {
  try {
    const { tag, path } = await request.json()
    
    console.log('🔄 Revalidation リクエスト受信:', { tag, path })
    
    if (tag) {
      revalidateTag(tag)
      console.log('✅ Tag revalidated:', tag)
    }
    
    if (path) {
      revalidatePath(path)
      console.log('✅ Path revalidated:', path)
    }
    
    if (!tag && !path) {
      // デフォルトで主要ページを更新
      revalidatePath('/')
      revalidatePath('/blog')
      revalidatePath('/shorts')
      console.log('✅ Default paths revalidated')
    }
    
    // 公開サイトも更新
    console.log('🔄 公開サイトの更新を開始...')
    // const publicSiteResult = await revalidatePublicSite(
    //   path ? [path] : ['/', '/shorts', '/blog'],
    //   tag ? [tag] : ['shorts', 'stories', 'blog']
    // )
    
    return NextResponse.json({ 
      success: true, 
      message: 'ページを更新しました',
      revalidated: { tag, path },
      // publicSite: publicSiteResult
    })
  } catch (error) {
    console.error('Revalidation エラー:', error)
    return NextResponse.json(
      { error: 'ページ更新に失敗しました' }, 
      { status: 500 }
    )
  }
}