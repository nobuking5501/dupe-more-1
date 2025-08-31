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
  console.log('Claude API小話生成開始 - 日付:', reportData.report_date)
  
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
      is_featured: true
    }
  } catch (error) {
    console.error('小話生成エラー:', error)
    await logMessage('error', '小話生成に失敗しました', { error: error instanceof Error ? error.message : "Unknown error", reportDate: reportData.report_date })
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const targetDate = requestData.date
    
    if (!targetDate) {
      return NextResponse.json(
        { error: '日付は必須です' }, 
        { status: 400 }
      )
    }

    console.log('📝 小話生成リクエスト受信 - 対象日:', targetDate)
    await logMessage('info', `小話生成開始: ${targetDate}`)

    // 対象日の日報を取得（複数あっても大丈夫）
    const { data: reports, error: reportError } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', targetDate)

    console.log('📊 クエリ結果:', {
      targetDate,
      reportError,
      reportCount: reports?.length || 0,
      reports: reports?.map(r => ({ id: r.id, date: r.report_date, hasCustomer: !!r.customer_attributes })) || []
    })

    if (reportError || !reports || reports.length === 0) {
      const errorMsg = `日報が見つかりません: ${targetDate}`
      console.error('❌', errorMsg, 'Error:', reportError)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    // 有効なデータがある日報を選択（空でないもの）
    const validReport = reports.find(report => 
      report.customer_attributes && 
      report.customer_attributes.trim() !== '' &&
      report.visit_reason_purpose &&
      report.visit_reason_purpose.trim() !== ''
    )

    if (!validReport) {
      const errorMsg = `有効な日報データが見つかりません: ${targetDate}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    const report = validReport

    // 既存の小話があるかチェック（冪等性） - 再生成のため一時的に無効化
    const { data: existingStory, error: checkError } = await supabase
      .from('short_stories')
      .select('id, title')
      .eq('report_date', targetDate)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ 小話重複チェックエラー:', checkError)
      // エラーは無視して続行（再生成モード）
    }

    if (existingStory) {
      console.log('🔄 既存小話を新しいプロンプトで更新します:', existingStory.title)
      await logMessage('info', `小話再生成: ${existingStory.title}を更新`, { storyId: existingStory.id })
    }

    console.log('🤖 Claude APIで小話生成中...')
    const storyData = await generateShortStory(report)
    
    console.log('💾 Supabaseに小話を保存中...')
    
    // 他の小話のis_featuredをfalseに更新
    await supabase
      .from('short_stories')
      .update({ is_featured: false })
      .neq('id', 'dummy')

    // 既存レコードがある場合は更新、ない場合は挿入
    let newStory, saveError
    if (existingStory) {
      // 既存レコードを更新
      const { data, error } = await supabase
        .from('short_stories')
        .update(storyData)
        .eq('id', existingStory.id)
        .select()
        .single()
      newStory = data
      saveError = error
      console.log('📝 既存レコードを更新しました:', existingStory.id)
    } else {
      // 新規レコードを挿入
      const { data, error } = await supabase
        .from('short_stories')
        .insert([storyData])
        .select()
        .single()
      newStory = data
      saveError = error
      console.log('📝 新規レコードを挿入しました')
    }

    if (saveError) {
      console.error('❌ Supabase小話保存エラー:', saveError)
      await logMessage('error', '小話保存失敗', { error: saveError.message })
      return NextResponse.json(
        { error: `小話保存失敗: ${saveError.message}` }, 
        { status: 500 }
      )
    }

    console.log('✅ 小話をSupabaseに保存しました:', newStory.id)
    await logMessage('info', `小話生成完了: ${newStory.title}`, { storyId: newStory.id })
    
    // 小話生成後に公開サイトを更新
    console.log('🔄 公開サイトの更新を開始...')
    // await revalidateAfterStoryGeneration()
    
    return NextResponse.json(newStory)
  } catch (error) {
    console.error('小話生成エラー:', error)
    await logMessage('error', '小話生成に失敗しました', { error: error instanceof Error ? error.message : "Unknown error" })
    return NextResponse.json({ error: '小話の生成に失敗しました' }, { status: 500 })
  }
}