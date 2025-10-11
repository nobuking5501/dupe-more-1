import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { callClaudeCleanAPI } from '@/lib/claude-clean'

export async function POST(request: Request) {
  try {
    console.log('📝 メインサイト全ブログ清書リクエスト受信')

    // 全ブログを取得
    const blogsSnapshot = await adminDb
      .collection('blog_posts')
      .orderBy('createdAt', 'asc')
      .get()

    const allBlogs = blogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    if (allBlogs.length === 0) {
      return NextResponse.json({
        message: '清書対象のブログがありません',
        cleaned: 0
      })
    }

    console.log('📊 清書対象ブログ数:', allBlogs.length)

    const results = []
    let successCount = 0
    let errorCount = 0

    // 各ブログの清書処理
    for (let i = 0; i < allBlogs.length; i++) {
      const blog = allBlogs[i]

      try {
        console.log(`🤖 清書中 ${i + 1}/${allBlogs.length}: ${blog.title}`)

        // 現在のコンテンツが既に清書済みかチェック（行末に改行+スペースがあるか）
        const isAlreadyCleaned = blog.content && blog.content.includes('\n ')

        if (isAlreadyCleaned) {
          console.log(`✅ スキップ（既に清書済み）: ${blog.title}`)
          results.push({
            blogId: blog.id,
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
          .doc(blog.id)
          .update({
            content: cleanedContent,
            updatedAt: FieldValue.serverTimestamp()
          })

        console.log(`✅ 清書完了 ${i + 1}/${allBlogs.length}: ${blog.title}`)
        successCount++
        results.push({
          blogId: blog.id,
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
          blogId: blog.id,
          title: blog.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log('📊 メインサイト清書完了 - 成功:', successCount, '件, エラー:', errorCount, '件')

    return NextResponse.json({
      message: `メインサイトブログ清書完了: ${successCount}件成功、${errorCount}件エラー`,
      total: allBlogs.length,
      cleaned: successCount,
      errors: errorCount,
      results: results
    })
  } catch (error) {
    console.error('メインサイト全ブログ清書エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'メインサイト全ブログの清書に失敗しました',
      details: errorMessage
    }, { status: 500 })
  }
}
