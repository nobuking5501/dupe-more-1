import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaudeCleanAPI } from '@/lib/claude-clean'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function logMessage(level: 'info' | 'warn' | 'error', message: string, context: any = {}) {
  try {
    await supabase
      .from('agent_logs')
      .insert([{ level, message, context }])
  } catch (error) {
    console.error('ログ保存エラー:', error)
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 全ブログ清書リクエスト受信')
    await logMessage('info', '全ブログ清書開始')

    // 全ブログを取得
    const { data: allBlogs, error: blogsError } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: true })

    if (blogsError) {
      console.error('❌ ブログ取得エラー:', blogsError)
      return NextResponse.json({ error: 'ブログの取得に失敗しました' }, { status: 500 })
    }

    if (!allBlogs || allBlogs.length === 0) {
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
        // 但し、特定の未清書ブログIDは強制的に清書する
        const forceCleanIds = [
          'caa368ca-05b1-4012-97dc-9994461b64c6',
          '7e0d26f8-3aae-4515-be66-326d478f2eee', 
          'd5b1fcd0-9597-466d-8d3f-f4813ed09031'
        ]
        
        const isAlreadyCleaned = blog.content && blog.content.includes('\n ') && !forceCleanIds.includes(blog.id)
        
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
        
        // Supabaseで更新
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ 
            content: cleanedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', blog.id)

        if (updateError) {
          console.error('❌ ブログ更新エラー:', updateError)
          errorCount++
          results.push({
            blogId: blog.id,
            title: blog.title,
            status: 'error',
            error: updateError?.message || "Unknown error"
          })
        } else {
          console.log(`✅ 清書完了 ${i + 1}/${allBlogs.length}: ${blog.title}`)
          successCount++
          results.push({
            blogId: blog.id,
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
          blogId: blog.id,
          title: blog.title,
          status: 'error',
          error: error instanceof Error ? error.message : "Unknown error"
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await logMessage('error', '全ブログ清書に失敗しました', { error: errorMessage })
    return NextResponse.json({ error: '全ブログの清書に失敗しました' }, { status: 500 })
  }
}