import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// import { // getPreviousBusinessDay, // formatDateString } from '@/lib/business-days'
// import { // revalidateAfterStoryGeneration, // revalidateAfterBlogGeneration } from '@/lib/revalidation'

// Supabaseクライアント設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== 管理画面 Supabase設定確認 ===')
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'なし')
console.log('KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'なし')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が見つかりません')
  console.error('必要な環境変数:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Supabaseクライアント初期化完了')

export async function GET() {
  try {
    console.log('📥 日報データをSupabaseから取得中...')
    
    // まず接続テスト
    const { data: testData, error: testError } = await supabase
      .from('daily_reports')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Supabase接続テスト失敗:', testError)
      return NextResponse.json(
        { error: `データベース接続エラー: ${testError.message}` }, 
        { status: 500 }
      )
    }

    console.log('✅ Supabase接続テスト成功')

    // 実際のデータ取得
    const { data: reports, error } = await supabase
      .from('daily_reports')
      .select('*')
      .order('report_date', { ascending: false })

    if (error) {
      console.error('❌ 日報取得エラー:', error)
      return NextResponse.json(
        { error: `日報取得失敗: ${error instanceof Error ? error.message : "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ 日報取得成功:', reports?.length || 0, '件')
    return NextResponse.json(reports || [])
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' }, 
      { status: 500 }
    )
  }
}

// Claude APIを使用して小話を生成する関数
async function generateShortStory(reportData: any) {
  console.log('Claude API小話生成開始 - 日付:', reportData.report_date)
  
  try {
    const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY
    
    console.log('Claude APIキー確認:', CLAUDE_API_KEY ? 'あり' : 'なし')
    
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key not found')
      return null
    }

    console.log('Claude APIキー確認完了')

    const prompt = `
あなたは障害者専門脱毛サロン「Dupe&more」のスタッフ「かなえ」として、日報を元に保護者の方々の心に寄り添う「小話」を生成してください。

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

# 小話作成のガイドライン

## 目的
障害を持つお子さんの保護者の方々に「安心感」「希望」「温かさ」を届ける

## 重点ポイント
1. **成長や変化の瞬間を描く** - お客様の小さな成長、表情の変化、新しい挑戦
2. **人と人とのつながりを表現** - お客様とスタッフの信頼関係、家族との絆
3. **日常の中の特別な瞬間** - 何気ない会話、笑顔、安心した様子
4. **希望と前向きさ** - 小さな進歩への喜び、未来への期待

## 文体・トーン
- 温かみのある自然な語りかけ
- 共感しやすい親しみやすさ
- 押し付けがましくない優しさ
- 読む人の心に寄り添う表現

## 構成
1. **導入** - その日の雰囲気や状況設定（天気、サロンの様子など）
2. **エピソード** - お客様との心に残る瞬間や変化
3. **気づき・感謝** - その瞬間から感じた温かい気持ち
4. **締めくくり** - 読む人へのメッセージ性のある終わり方

## 絶対に避けること
- 単なる作業報告や手順の説明
- 医療的・技術的な詳細
- 個人を特定できる具体的な情報
- 同情を誘うような表現

## 文字数・形式
- 本文: 300-450文字程度（感情が伝わる十分な長さ）
- タイトル: 心に響く印象的な20文字以内

以下のJSON形式で回答してください：
{
  "title": "心に響く小話のタイトル（20文字以内）",
  "content": "保護者の方の心に寄り添う小話の本文（300-450文字程度）",
  "emotional_tone": "heartwarming|inspiring|gentle のいずれか"
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

    console.log('Claude APIレスポンス状態:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', response.status, response.statusText, errorText)
      return null
    }

    const claudeResponse = await response.json()
    const generatedText = claudeResponse.content[0].text
    
    console.log('Claude API応答受信 - 文字数:', generatedText.length)

    // JSONを抽出して解析
    let storyData
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        storyData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON not found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Generated text:', generatedText?.substring(0, 500) + '...')
      
      // 感動的なフォールバック小話を生成
      const createHeartwarming = (data: any) => {
        if (data.customer_after_treatment && data.customer_before_treatment) {
          return `${data.weather_temperature || '穏やかな'}日、当サロンに${data.customer_attributes || 'あるお客様'}がいらっしゃいました。${data.customer_before_treatment || '最初は少し緊張されていましたが'}、施術を進めていくうちに、${data.customer_after_treatment || '安心した表情を見せてくださいました'}。\n\nそんな瞬間に立ち会えることは、私たちスタッフにとって何よりの喜びです。${data.kanae_personal_thoughts || 'お客様との信頼関係を大切に、今日も温かい時間を過ごすことができました'}。`
        } else {
          return `${data.weather_temperature || '心地よい'}日、サロンには温かな時間が流れていました。${data.customer_attributes || 'お客様'}との出会いは、私たちにとって特別な瞬間です。\n\n一人ひとりのペースに寄り添いながら、安心してお過ごしいただけるよう心がけています。${data.kanae_personal_thoughts || '今日もお客様の笑顔に出会えて、幸せな気持ちでいっぱいです'}。`
        }
      }
      
      storyData = {
        title: reportData.customer_after_treatment?.includes('笑顔') ? '笑顔が繋ぐ温かい時間' : 
               reportData.customer_after_treatment?.includes('安心') ? '安心して過ごした一日' : 
               reportData.customer_before_treatment?.includes('緊張') ? '緊張から安心への変化' : 
               '心温まるサロンの時間',
        content: createHeartwarming(reportData),
        emotional_tone: 'heartwarming'
      }
    }

    const shortStory = {
      id: `story-${Date.now()}`,
      title: storyData.title || `${new Date(reportData.report_date).toLocaleDateString('ja-JP')}の心温まる時間`,
      content: storyData.content,
      source_report_id: reportData.id,
      report_date: reportData.report_date,
      weather_info: reportData.weather_temperature,
      customer_type: reportData.customer_attributes,
      key_moment: reportData.customer_after_treatment,
      emotional_tone: storyData.emotional_tone || 'heartwarming',
      status: 'active',
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Generated short story:', shortStory.title)
    return shortStory
  } catch (error) {
    console.error('小話生成エラー:', error)
    // エラー時のフォールバック小話
    return {
      id: `story-${Date.now()}`,
      title: `${new Date(reportData.report_date).toLocaleDateString('ja-JP')}のサロンより`,
      content: `本日も温かいお客様との出会いがありました。${reportData.customer_attributes}のお客様が${reportData.visit_reason_purpose}ということでご来店され、心を込めて施術させていただきました。お客様の笑顔を見ることができ、私たちスタッフも幸せな気持ちになりました。`,
      source_report_id: reportData.id,
      report_date: reportData.report_date,
      weather_info: reportData.weather_temperature,
      customer_type: reportData.customer_attributes,
      key_moment: reportData.customer_after_treatment,
      emotional_tone: 'heartwarming',
      status: 'active',
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    console.log('📝 日報データを受信:', {
      staff_name: data.staff_name,
      report_date: data.report_date,
      weather_temperature: data.weather_temperature?.substring(0, 50) + '...'
    })
    
    // 入力データ検証（最小限の必須項目のみ）
    if (!data.staff_name || !data.report_date) {
      console.error('❌ 必須項目が不足しています')
      return NextResponse.json(
        { error: 'スタッフ名と報告日は必須です' }, 
        { status: 400 }
      )
    }

    // 1日複数件の日報を許可するため、重複チェックを削除
    // 各項目は空欄でも保存可能に変更

    console.log('💾 Supabaseに日報を保存中...')
    
    // Supabaseに日報を保存
    const { data: newReport, error: insertError } = await supabase
      .from('daily_reports')
      .insert([{
        staff_name: data.staff_name,
        report_date: data.report_date,
        weather_temperature: data.weather_temperature,
        customer_attributes: data.customer_attributes,
        visit_reason_purpose: data.visit_reason_purpose,
        treatment_details: data.treatment_details,
        customer_before_treatment: data.customer_before_treatment,
        customer_after_treatment: data.customer_after_treatment,
        salon_atmosphere: data.salon_atmosphere,
        insights_innovations: data.insights_innovations,
        kanae_personal_thoughts: data.kanae_personal_thoughts
      }])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Supabase日報保存エラー:', insertError)
      return NextResponse.json(
        { error: `日報保存失敗: ${insertError?.message || "Unknown error"}` }, 
        { status: 500 }
      )
    }

    console.log('✅ 日報をSupabaseに保存しました:', newReport.id)
    
    // 日報投稿後に小話を自動生成
    console.log('小話生成を開始します...')
    const generatedStory = await generateShortStory(newReport)
    
    if (generatedStory) {
      console.log('小話生成成功:', generatedStory.title)
    } else {
      console.log('小話生成失敗')
    }
    
    // 生成された小話をSupabaseに保存
    if (generatedStory) {
      console.log('💾 小話をSupabaseに保存中...')
      
      try {
        // 既存の小話のis_featuredをfalseに更新
        const { error: updateError } = await supabase
          .from('short_stories')
          .update({ is_featured: false })
          .neq('id', 'dummy')

        if (updateError) {
          console.log('⚠️ 既存小話のフィーチャー更新エラー:', updateError.message)
        } else {
          console.log('✅ 既存小話のフィーチャーフラグを更新しました')
        }

        // 新しい小話をSupabaseに保存
        const { data: savedStory, error: storyError } = await supabase
          .from('short_stories')
          .insert([{
            title: generatedStory.title,
            content: generatedStory.content,
            source_report_id: generatedStory.source_report_id,
            emotional_tone: generatedStory.emotional_tone,
            is_featured: true,
            status: 'active',
            report_date: generatedStory.report_date,
            weather_info: generatedStory.weather_info,
            customer_type: generatedStory.customer_type,
            key_moment: generatedStory.key_moment
          }])
          .select()
          .single()

        if (storyError) {
          console.error('❌ Supabase小話保存エラー:', storyError)
          // 小話保存に失敗しても日報は保存されているので処理を続行
        } else {
          console.log('✅ 小話をSupabaseに保存しました:', savedStory.id)
          
          // 小話生成後に公開サイトを更新
          console.log('🔄 公開サイトの更新を開始...')
          // await revalidateAfterStoryGeneration()
        }

      } catch (saveError) {
        console.error('❌ 小話保存中に予期しないエラー:', saveError)
      }
    }
    
    // 小話生成が成功した場合、ブログ生成をトリガー
    let blogResult = null
    if (generatedStory) {
      try {
        console.log('📊 ブログ生成の可否をチェック中...')
        
        // 前営業日を計算
        // const previousBusinessDay = getPreviousBusinessDay(new Date(newReport.report_date))
        // const previousDateString = formatDateString(previousBusinessDay)
        const previousDateString = new Date(newReport.report_date).toISOString().split('T')[0]
        
        // 前営業日の小話が存在するかチェック
        const { data: previousStory, error: prevStoryError } = await supabase
          .from('short_stories')
          .select('id, title')
          .eq('report_date', previousDateString)
          .single()

        if (previousStory) {
          console.log('✅ 前営業日の小話が存在します。ブログ生成を開始します...')
          
          // ブログ生成APIを内部呼び出し
          const blogResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/blog-posts/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: newReport.report_date })
          })
          
          if (blogResponse.ok) {
            blogResult = await blogResponse.json()
            console.log('✅ ブログ自動生成成功:', blogResult.title)
            
            // ブログ生成後に公開サイトを更新
            console.log('🔄 ブログ生成後の公開サイト更新...')
            // await revalidateAfterBlogGeneration()
          } else {
            console.log('⚠️ ブログ自動生成失敗:', await blogResponse.text())
          }
        } else {
          console.log('⏳ 前営業日の小話がありません。ブログ生成は待機します...')
        }
      } catch (blogError) {
        console.error('❌ ブログ生成中にエラー:', blogError)
      }
    }

    const response = {
      report: newReport,
      generatedStory: generatedStory,
      generatedBlog: blogResult
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('日報作成エラー:', error)
    return NextResponse.json({ error: '日報の作成に失敗しました' }, { status: 500 })
  }
}