import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { callClaudeCleanAPI } from '@/lib/claude-clean'

export async function POST(request: Request) {
  try {
    const { blogIds } = await request.json()

    if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return NextResponse.json({ error: 'ブログIDの配列が必要です' }, { status: 400 })
    }

    console.log('📝 特定ブログ清書リクエスト受信 - 対象ID:', blogIds)

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const blogId of blogIds) {
      try {
        // 指定IDのブログを取得
        const blogDoc = await adminDb
          .collection('blog_posts')
          .doc(blogId)
          .get()

        if (!blogDoc.exists) {
          console.error('❌ ブログ取得エラー: ブログが見つかりません')
          errorCount++
          results.push({
            blogId: blogId,
            status: 'error',
            error: 'ブログが見つかりません'
          })
          continue
        }

        const blog = { id: blogDoc.id, ...(blogDoc.data() as any) }

        console.log(`🤖 清書中: ${blog.title}`)

        // 現在のコンテンツが既に清書済みかチェック
        const isAlreadyCleaned = blog.content && blog.content.includes('\n ')

        if (isAlreadyCleaned) {
          console.log(`✅ スキップ（既に清書済み）: ${blog.title}`)
          results.push({
            blogId: blogId,
            title: blog.title,
            status: 'skipped',
            reason: '既に清書済み'
          })
          continue
        }

        // Claude清書API呼び出し
        const cleanedContent = await callClaudeCleanAPI(blog.content || '')

        // Firestoreで更新
        await adminDb
          .collection('blog_posts')
          .doc(blogId)
          .update({
            content: cleanedContent,
            updatedAt: FieldValue.serverTimestamp()
          })

        console.log(`✅ 清書完了: ${blog.title}`)
        successCount++
        results.push({
          blogId: blogId,
          title: blog.title,
          status: 'success',
          originalLength: blog.content?.length || 0,
          cleanedLength: cleanedContent.length
        })

        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error('❌ ブログ清書エラー:', error)
        errorCount++
        results.push({
          blogId: blogId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log('📊 特定ブログ清書完了 - 成功:', successCount, '件, エラー:', errorCount, '件')

    return NextResponse.json({
      message: `特定ブログ清書完了: ${successCount}件成功、${errorCount}件エラー`,
      total: blogIds.length,
      cleaned: successCount,
      errors: errorCount,
      results: results
    })
  } catch (error) {
    console.error('特定ブログ清書エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: '特定ブログの清書に失敗しました',
      details: errorMessage
    }, { status: 500 })
  }
}
