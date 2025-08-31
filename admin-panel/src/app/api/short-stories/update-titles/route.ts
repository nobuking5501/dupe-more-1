import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function generateUniqueTitle(storyData: any) {
  try {
    const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY
    
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not found')
    }

    const prompt = `
以下の小話に対して、魅力的で個性的なタイトルを生成してください。

# 小話データ
- 現在のタイトル: ${storyData.title}
- 内容の一部: ${storyData.content.substring(0, 200)}...
- お客様属性: ${storyData.customer_type}
- 印象的な瞬間: ${storyData.key_moment}
- 感情トーン: ${storyData.emotional_tone}

# タイトルの条件
- 20文字以内で簡潔に
- 感動的で親しみやすい
- 「○○の心温まる時間」のような定型パターンは避ける
- お客様のエピソードの核心を表現
- 読者が興味を持つキャッチーさ
- プライバシーを保護（具体的な年齢・疾患名は避ける）

# 出力フォーマット（JSON）
{
  "new_title": "新しいタイトル（20文字以内）"
}
`

    console.log('Claude APIに新タイトル生成リクエスト送信')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Claude API error: ${response.status} ${errorText}`)
    }

    const claudeResponse = await response.json()
    const generatedText = claudeResponse.content[0].text
    
    // JSONを抽出して解析
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        let cleanJson = jsonMatch[0]
          .replace(/[\x00-\x1f\x7f-\x9f]/g, ' ')
          .replace(/\\n/g, '\\n')
          .replace(/\\"/g, '\\"')
        
        const titleData = JSON.parse(cleanJson)
        return titleData.new_title || `${storyData.customer_type}の特別な時間`
      } else {
        throw new Error('JSON not found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // フォールバック：お客様属性に基づいたタイトル
      if (storyData.customer_type.includes('男性')) {
        return '勇気ある一歩の物語'
      } else if (storyData.customer_type.includes('女性')) {
        return '笑顔が輝いた瞬間'
      } else {
        return '心に響く特別な時間'
      }
    }
  } catch (error) {
    console.error('タイトル生成エラー:', error)
    return `特別な${storyData.report_date.split('-')[2]}日の物語`
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 小話タイトル更新リクエスト受信')

    // 「○○の心温まる時間」パターンの小話を取得
    const { data: genericStories, error: fetchError } = await supabase
      .from('short_stories')
      .select('*')
      .like('title', '%の心温まる時間')

    if (fetchError) {
      console.error('❌ 小話取得エラー:', fetchError)
      return NextResponse.json({ error: '小話の取得に失敗しました' }, { status: 500 })
    }

    console.log('📊 更新対象の小話:', genericStories.length, '件')

    if (genericStories.length === 0) {
      return NextResponse.json({ 
        message: '更新対象の小話が見つかりませんでした',
        updated: 0 
      })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // 各小話のタイトルを更新
    for (const story of genericStories) {
      try {
        console.log('🎯 タイトル生成中:', story.title)
        const newTitle = await generateUniqueTitle(story)
        
        // データベースのタイトルを更新
        const { error: updateError } = await supabase
          .from('short_stories')
          .update({ title: newTitle })
          .eq('id', story.id)

        if (updateError) {
          console.error('❌ タイトル更新エラー:', updateError)
          errorCount++
          results.push({
            storyId: story.id,
            oldTitle: story.title,
            status: 'error',
            error: updateError.message
          })
        } else {
          console.log('✅ タイトル更新完了:', story.title, '->', newTitle)
          successCount++
          results.push({
            storyId: story.id,
            oldTitle: story.title,
            newTitle: newTitle,
            status: 'success'
          })
        }

        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error('❌ タイトル更新エラー:', error)
        errorCount++
        results.push({
          storyId: story.id,
          oldTitle: story.title,
          status: 'error',
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    console.log('📊 更新完了 - 成功:', successCount, '件, エラー:', errorCount, '件')

    return NextResponse.json({
      message: `タイトル更新完了: ${successCount}件成功、${errorCount}件エラー`,
      updated: successCount,
      errors: errorCount,
      results: results
    })
  } catch (error) {
    console.error('タイトル更新処理エラー:', error)
    return NextResponse.json({ error: 'タイトル更新処理に失敗しました' }, { status: 500 })
  }
}