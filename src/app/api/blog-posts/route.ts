import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

export async function GET() {
  try {
    const postsSnapshot = await adminDb
      .collection('blog_posts')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .get()

    const data = postsSnapshot.docs.map(doc => {
      const docData = doc.data() as any
      return {
        id: doc.id,
        ...docData,
        createdAt: docData.createdAt?.toDate().toISOString(),
        updatedAt: docData.updatedAt?.toDate().toISOString(),
        publishedAt: docData.publishedAt?.toDate().toISOString(),
      }
    })

    // データを既存のフォーマットに変換
    const formattedData = data.map(post => ({
      ...post,
      published: post.status === 'published',
      staff: { name: 'かなえ' }, // Default staff name
      excerpt: post.summary || post.excerpt || (post.content ? post.content.slice(0, 200) + '...' : ''),
      content: post.content // Make sure content is available for blog detail page
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Service error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'ブログ記事の取得に失敗しました',
      details: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const postRef = adminDb.collection('blog_posts').doc()
    const postData = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: FieldValue.serverTimestamp()
    }

    await postRef.set(postData)

    const newPost = {
      id: postRef.id,
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    }

    return NextResponse.json(newPost)
  } catch (error) {
    console.error('Service error:', error)
    return NextResponse.json({ error: 'ブログ記事の作成に失敗しました' }, { status: 500 })
  }
}
