import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

console.log('=== 管理画面 Firebase設定確認 ===')

export async function GET() {
  try {
    console.log('📝 ブログ記事一覧取得リクエスト')

    const blogPostsSnapshot = await adminDb
      .collection('blog_posts')
      .orderBy('createdAt', 'desc')
      .get()

    const blogPosts = blogPostsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      publishedAt: doc.data().publishedAt?.toDate().toISOString(),
    }))

    console.log('✅ ブログ記事取得成功:', blogPosts.length, '件')
    return NextResponse.json(blogPosts)
  } catch (error) {
    console.error('ブログ記事取得エラー:', error)
    return NextResponse.json({ error: 'ブログ記事の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    console.log('📝 ブログ記事作成リクエスト')

    // Firestoreにブログ記事を保存（キャメルケースに変換）
    const postRef = adminDb.collection('blog_posts').doc()
    const postData = {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      slug: data.slug,
      categoryId: data.category_id,
      categoryName: data.category_name,
      tags: data.tags || [],
      featuredImage: data.featured_image,
      author: data.author,
      authorRole: data.author_role,
      status: data.status || 'published',
      viewCount: data.view_count || 0,
      likeCount: data.like_count || 0,
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

    console.log('✅ ブログ記事作成成功:', newPost.id)
    return NextResponse.json(newPost)
  } catch (error) {
    console.error('ブログ記事作成エラー:', error)
    return NextResponse.json({ error: 'ブログ記事の作成に失敗しました' }, { status: 500 })
  }
}
