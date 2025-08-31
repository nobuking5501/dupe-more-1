import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaudeCleanAPI } from '@/lib/claude-clean'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
        const { data: blog, error: fetchError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', blogId)
          .single()

        if (fetchError || !blog) {
          console.error('❌ ブログ取得エラー:', fetchError)
          errorCount++
          results.push({
            blogId: blogId,
            status: 'error',
            error: 'ブログが見つかりません'
          })
          continue
        }

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
        
        // Supabaseで更新
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ 
            content: cleanedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', blogId)

        if (updateError) {
          console.error('❌ ブログ更新エラー:', updateError)
          errorCount++
          results.push({
            blogId: blogId,
            title: blog.title,
            status: 'error',
            error: updateError?.message || "Unknown error"
          })
        } else {
          console.log(`✅ 清書完了: ${blog.title}`)
          successCount++
          results.push({
            blogId: blogId,
            title: blog.title,
            status: 'success',
            originalLength: blog.content?.length || 0,
            cleanedLength: cleanedContent.length
          })
        }

        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error('❌ ブログ清書エラー:', error)
        errorCount++
        results.push({
          blogId: blogId,
          status: 'error',
          error: error instanceof Error ? error.message : "Unknown error"
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ 
      error: '特定ブログの清書に失敗しました',
      details: errorMessage 
    }, { status: 500 })
  }
}