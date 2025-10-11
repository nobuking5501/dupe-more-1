import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    console.log('📝 ブログ記事取得開始 - ID:', params.id)

    const docRef = adminDb.collection('blog_posts').doc(params.id)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      console.log('⚠️ ブログ記事が見つかりません')
      return NextResponse.json(
        { error: 'ブログ記事が見つかりません' },
        { status: 404 }
      )
    }

    const data = docSnap.data()

    // 公開済みのみ返す
    if (data?.status !== 'published') {
      console.log('⚠️ 非公開のブログ記事')
      return NextResponse.json(
        { error: 'ブログ記事が見つかりません' },
        { status: 404 }
      )
    }

    // データを既存のフォーマットに変換
    const formattedData = {
      id: docSnap.id,
      title: data.title,
      content: data.content,
      slug: data.slug,
      summary: data.summary,
      newerDate: data.newerDate,
      olderDate: data.olderDate,
      status: data.status,
      publishedAt: data.publishedAt?.toDate().toISOString(),
      authorId: data.authorId,
      authorName: data.authorName || 'かなえ',
      originalReportId: data.originalReportId,
      tags: data.tags || [],
      excerpt: data.excerpt,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      published: data.status === 'published',
      staff: { name: data.authorName || 'かなえ' }
    }

    console.log('✅ ブログ記事取得成功:', formattedData.title)
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('❌ ブログ記事取得エラー:', error)
    return NextResponse.json(
      { error: 'ブログ記事の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    console.log('📝 ブログ記事更新開始 - ID:', params.id)

    const data = await request.json()

    const docRef = adminDb.collection('blog_posts').doc(params.id)
    await docRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    })

    const updatedDoc = await docRef.get()
    const updatedData = updatedDoc.data()

    const formattedData = {
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData?.createdAt?.toDate().toISOString(),
      updatedAt: updatedData?.updatedAt?.toDate().toISOString(),
      publishedAt: updatedData?.publishedAt?.toDate().toISOString()
    }

    console.log('✅ ブログ記事更新成功')
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('❌ ブログ記事更新エラー:', error)
    return NextResponse.json(
      { error: 'ブログ記事の更新に失敗しました' },
      { status: 500 }
    )
  }
}
