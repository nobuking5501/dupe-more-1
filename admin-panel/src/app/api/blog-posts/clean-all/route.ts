import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { callClaudeCleanAPI } from '@/lib/claude-clean'

console.log('=== 管理画面 Firebase設定確認 ===')

async function logMessage(level: 'info' | 'warn' | 'error', message: string, context: any = {}) {
  try {
    await adminDb.collection('agent_logs').add({
      level,
      message,
      context,
      createdAt: FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.error('ログ保存エラー:', error)
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 全ブログ清書リクエスト受信')
    await logMessage('info', '全ブログ清書開始')

    // 全ブログを取得
    const blogsSnapshot = await adminDb
      .collection('blog_posts')
      .orderBy('createdAt', 'asc')
      .get()

    const allBlogs = blogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; title?: string; content?: string; createdAt?: any }>

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

        // 清書済み判定: 行頭スペース付き改行が一定数以上あれば清書済みとみなす
        // 「\n 」が5箇所以上 = 清書ルール（行頭スペース）が適用されている
        const newlineWithSpaceCount = (blog.content?.match(/\n /g) || []).length
        const isAlreadyCleaned = newlineWithSpaceCount >= 5

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

    console.log('📊 清書完了 - 成功:', successCount, '件, エラー:', errorCount, '件')
    await logMessage('info', `全ブログ清書完了: 成功${successCount}件、エラー${errorCount}件`)

    return NextResponse.json({
      message: `ブログ清書完了: ${successCount}件成功、${errorCount}件エラー`,
      total: allBlogs.length,
      cleaned: successCount,
      errors: errorCount,
      results: results
    })
  } catch (error) {
    console.error('全ブログ清書エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logMessage('error', '全ブログ清書に失敗しました', { error: errorMessage })
    return NextResponse.json({ error: '全ブログの清書に失敗しました' }, { status: 500 })
  }
}
