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
        title: `${new Date(reportData.report_date).toLocaleDateString('ja-JP')}の心温まる時間`,
        short_version: fallbackContent.substring(0, 200),
        full_version: fallbackContent,
        emotional_tone: 'heartwarming'
      }
    }

    return {
      title: storyData.title || `${new Date(reportData.report_date).toLocaleDateString('ja-JP')}の心温まる時間`,
      content: storyData.full_version || storyData.content, // 長文版をメインコンテンツとして使用
      source_report_id: reportData.id,
      report_date: reportData.report_date,
      weather_info: reportData.weather_temperature,
      customer_type: reportData.customer_attributes,
      key_moment: reportData.customer_after_treatment,
      emotional_tone: storyData.emotional_tone || 'heartwarming',
      status: 'active',
      is_featured: false // IDベース生成ではis_featured=falseとする
    }
  } catch (error) {
    console.error('小話生成エラー:', error)
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error'
    await logMessage('error', '小話生成に失敗しました', { error: errorMessage, reportId: reportData.id })
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const reportId = requestData.report_id
    
    if (!reportId) {
      return NextResponse.json(
        { error: '日報IDは必須です' }, 
        { status: 400 }
      )
    }

    console.log('📝 ID指定小話生成リクエスト受信 - 日報ID:', reportId)
    await logMessage('info', `ID指定小話生成開始: ${reportId}`)

    // 指定IDの日報を取得
    const { data: report, error: reportError } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      const errorMsg = `日報が見つかりません: ${reportId}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    // 有効なデータかチェック
    if (!report.customer_attributes || !report.customer_attributes.trim()) {
      const errorMsg = `有効な日報データではありません: ${reportId}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // 既存の小話があるかチェック（この日報IDからの小話）
    const { data: existingStory, error: checkError } = await supabase
      .from('short_stories')
      .select('id, title')
      .eq('source_report_id', reportId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ 小話重複チェックエラー:', checkError)
      // エラーは無視して続行
    }

    if (existingStory) {
      console.log('✅ この日報IDからの小話が既に存在します:', existingStory.title)
      await logMessage('info', `既存小話を返却: ${existingStory.title}`, { storyId: existingStory.id })
      return NextResponse.json(existingStory)
    }

    console.log('🤖 Claude APIで小話生成中...')
    const storyData = await generateShortStory(report)
    
    console.log('💾 Supabaseに小話を保存中...')

    // Supabaseに小話を保存
    const { data: newStory, error: insertError } = await supabase
      .from('short_stories')
      .insert([storyData])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Supabase小話保存エラー:', insertError)
      await logMessage('error', '小話保存失敗', { error: insertError?.message || "Unknown error" })
      return NextResponse.json(
        { error: `小話保存失敗: ${insertError?.message || "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ 小話をSupabaseに保存しました:', newStory.id)
    await logMessage('info', `小話生成完了: ${newStory.title}`, { storyId: newStory.id })
    
    return NextResponse.json(newStory)
  } catch (error) {
    console.error('小話生成エラー:', error)
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error'
    await logMessage('error', '小話生成に失敗しました', { error: errorMessage })
    return NextResponse.json({ error: '小話の生成に失敗しました' }, { status: 500 })
  }
}