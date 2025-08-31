import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// import { // revalidateAfterStoryGeneration } from '@/lib/revalidation'

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

async function generateShortStory(reportData: any) {
  console.log('Claude API小話生成開始 - ID:', reportData.id)
  
  try {
    const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY
    
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not found')
    }

    const prompt = `
あなたは障害者専門脱毛サロン「Dupe&more」のスタッフ「かなえ」の視点で、
日報をもとに心温まる「小話」を生成してください。

# 日報データ
- 日付: ${reportData.report_date}
- 天気・気温: ${reportData.weather_temperature}
- お客様の属性: ${reportData.customer_attributes}
- 来店のきっかけ・目的: ${reportData.visit_reason_purpose}
- 施術内容: ${reportData.treatment_details}
- 施術前のお客様の様子: ${reportData.customer_before_treatment}
- 施術後のお客様の反応: ${reportData.customer_after_treatment}
- サロンの雰囲気: ${reportData.salon_atmosphere}
- 気づき・工夫: ${reportData.insights_innovations}
- かなえの感想: ${reportData.kanae_personal_thoughts}

# 小話の条件
- 保護者・ご家族に向けた温かいメッセージとして作成
- 障害を持つお客様への理解と配慮を必ず込める
- 具体的なエピソードを含める
- 感動的すぎず、自然で親しみやすい文体
- 語尾は「〜でした」「〜しました」を基本に統一
- お客様のプライバシーを保護（個人特定可能な情報は出さない）
  - 固有名詞（人名・学校・地域・疾患名など）は一般化
  - 医療的断定・比較広告・誇大表現は禁止
- 出力はトップページ用の短文版とアーカイブ用の長文版を両方生成する

# 出力フォーマット（JSON）
{
  "title": "小話のタイトル（20文字以内）",
  "short_version": "150〜200文字程度。トップページ用の軽い小話。",
  "full_version": "250〜350文字程度。アーカイブ用の詳細小話。",
  "emotional_tone": "heartwarming|inspiring|gentle|hopeful|lighthearted"
}
`

    console.log('Claude APIに送信するプロンプト長:', prompt.length, '文字')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
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
    
    console.log('Claude API応答受信 - 文字数:', generatedText.length)

    // JSONを抽出して解析
    let storyData
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        // 制御文字をクリーンアップ
        let cleanJson = jsonMatch[0]
          .replace(/[\x00-\x1f\x7f-\x9f]/g, ' ') // 制御文字を空白に置換
          .replace(/\\n/g, '\\n') // 改行文字をエスケープ
          .replace(/\\"/g, '\\"') // ダブルクォートをエスケープ
        
        console.log('Clean JSON:', cleanJson.substring(0, 200) + '...')
        storyData = JSON.parse(cleanJson)
      } else {
        throw new Error('JSON not found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // フォールバック：デフォルトの小話を生成
      const fallbackContent = `${reportData.weather_temperature}の日、${reportData.customer_attributes}のお客様がご来店されました。${reportData.visit_reason_purpose}ということで、心を込めて${reportData.treatment_details}をさせていただきました。${reportData.customer_after_treatment}お客様の笑顔を見ることができ、私たちも温かい気持ちになりました。`
      storyData = {
        title: `心温まる${reportData.report_date}の瞬間`,
        short_version: fallbackContent.substring(0, 200),
        full_version: fallbackContent,
        emotional_tone: 'heartwarming'
      }
    }

    return {
      title: storyData.title || `心温まる${reportData.report_date}の瞬間`,
      content: storyData.full_version || storyData.content,
      source_report_id: reportData.id,
      report_date: reportData.report_date,
      weather_info: reportData.weather_temperature,
      customer_type: reportData.customer_attributes,
      key_moment: reportData.customer_after_treatment,
      emotional_tone: storyData.emotional_tone || 'heartwarming',
      status: 'active',
      is_featured: false // 複数生成時はis_featured=false
    }
  } catch (error) {
    console.error('小話生成エラー:', error)
    await logMessage('error', '小話生成に失敗しました', { error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error", reportId: reportData.id })
    throw error
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 複数小話生成リクエスト受信')
    await logMessage('info', '複数小話生成開始')

    // 全日報を取得
    const { data: allReports, error: reportsError } = await supabase
      .from('daily_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (reportsError) {
      console.error('❌ 日報取得エラー:', reportsError)
      return NextResponse.json({ error: '日報の取得に失敗しました' }, { status: 500 })
    }

    // 既存の小話の日報IDを取得
    const { data: existingStories, error: storiesError } = await supabase
      .from('short_stories')
      .select('source_report_id')

    if (storiesError) {
      console.error('❌ 小話取得エラー:', storiesError)
      return NextResponse.json({ error: '既存小話の取得に失敗しました' }, { status: 500 })
    }

    const existingReportIds = new Set(existingStories.map(story => story.source_report_id))

    // 小話が生成されていない有効な日報を特定
    const missingReports = allReports.filter(report => {
      return !existingReportIds.has(report.id) && 
             report.customer_attributes && 
             report.customer_attributes.trim() !== ''
    })

    console.log('📊 生成対象レポート:', missingReports.length, '件')

    if (missingReports.length === 0) {
      return NextResponse.json({ 
        message: 'すべての有効な日報に対して小話が既に生成されています',
        generated: 0 
      })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // 各日報から小話を生成
    for (const report of missingReports) {
      try {
        console.log('🤖 小話生成中:', report.id, '(', report.customer_attributes, ')')
        const storyData = await generateShortStory(report)
        
        // Supabaseに保存（同じ日付でもIDが違えば保存可能）
        const { data: newStory, error: insertError } = await supabase
          .from('short_stories')
          .insert([storyData])
          .select()
          .single()

        if (insertError) {
          console.error('❌ 小話保存エラー:', insertError)
          errorCount++
          results.push({
            reportId: report.id,
            status: 'error',
            error: insertError?.message || "Unknown error"
          })
        } else {
          console.log('✅ 小話生成・保存完了:', newStory.id)
          successCount++
          results.push({
            reportId: report.id,
            storyId: newStory.id,
            title: newStory.title,
            status: 'success'
          })
        }

        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error('❌ 小話生成エラー:', error)
        errorCount++
        results.push({
          reportId: report.id,
          status: 'error',
          error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error"
        })
      }
    }

    console.log('📊 生成完了 - 成功:', successCount, '件, エラー:', errorCount, '件')
    await logMessage('info', `複数小話生成完了: 成功${successCount}件、エラー${errorCount}件`)

    // 成功した場合はサイト更新
    if (successCount > 0) {
      console.log('🔄 公開サイトの更新を開始...')
      // await revalidateAfterStoryGeneration()
    }

    return NextResponse.json({
      message: `小話生成完了: ${successCount}件成功、${errorCount}件エラー`,
      generated: successCount,
      errors: errorCount,
      results: results
    })
  } catch (error) {
    console.error('複数小話生成エラー:', error)
    await logMessage('error', '複数小話生成に失敗しました', { error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" })
    return NextResponse.json({ error: '複数小話の生成に失敗しました' }, { status: 500 })
  }
}