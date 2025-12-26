import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import { callClaudeGenerateAPI } from '@/lib/claude-generate'
import { callClaudeCleanAPI } from '@/lib/claude-clean'
import fetch from 'node-fetch'

console.log('=== 管理画面 Firebase設定確認 ===')

// Claude APIを使用して小話を生成する関数
async function generateShortStory(reportData: any) {
  console.log('Claude API小話生成開始 - 日付:', reportData.reportDate)

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
- 日付: ${reportData.reportDate}
- 天気・気温: ${reportData.weatherTemperature}
- お客様の属性: ${reportData.customerAttributes}
- 来店のきっかけ・目的: ${reportData.visitReasonPurpose}
- 施術内容: ${reportData.treatmentDetails}
- 施術前のお客様の様子: ${reportData.customerBeforeTreatment}
- 施術後のお客様の反応: ${reportData.customerAfterTreatment}
- サロンの雰囲気: ${reportData.salonAtmosphere}
- 気づき・工夫: ${reportData.insightsInnovations}
- かなえの感想: ${reportData.kanaePersonalThoughts}

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

    try {
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
        }),
        timeout: 60000  // 60秒タイムアウト
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
          if (data.customerAfterTreatment && data.customerBeforeTreatment) {
            return `${data.weatherTemperature || '穏やかな'}日、当サロンに${data.customerAttributes || 'あるお客様'}がいらっしゃいました。${data.customerBeforeTreatment || '最初は少し緊張されていましたが'}、施術を進めていくうちに、${data.customerAfterTreatment || '安心した表情を見せてくださいました'}。\n\nそんな瞬間に立ち会えることは、私たちスタッフにとって何よりの喜びです。${data.kanaePersonalThoughts || 'お客様との信頼関係を大切に、今日も温かい時間を過ごすことができました'}。`
          } else {
            return `${data.weatherTemperature || '心地よい'}日、サロンには温かな時間が流れていました。${data.customerAttributes || 'お客様'}との出会いは、私たちにとって特別な瞬間です。\n\n一人ひとりのペースに寄り添いながら、安心してお過ごしいただけるよう心がけています。${data.kanaePersonalThoughts || '今日もお客様の笑顔に出会えて、幸せな気持ちでいっぱいです'}。`
          }
        }

        storyData = {
          title: reportData.customerAfterTreatment?.includes('笑顔') ? '笑顔が繋ぐ温かい時間' :
                 reportData.customerAfterTreatment?.includes('安心') ? '安心して過ごした一日' :
                 reportData.customerBeforeTreatment?.includes('緊張') ? '緊張から安心への変化' :
                 '心温まるサロンの時間',
          content: createHeartwarming(reportData),
          emotional_tone: 'heartwarming'
        }
      }

      const shortStory = {
        title: storyData.title || `${new Date(reportData.reportDate).toLocaleDateString('ja-JP')}の心温まる時間`,
        content: storyData.content,
        sourceReportId: reportData.id,
        reportDate: reportData.reportDate,
        weatherInfo: reportData.weatherTemperature,
        customerType: reportData.customerAttributes,
        keyMoment: reportData.customerAfterTreatment,
        emotionalTone: storyData.emotional_tone || 'heartwarming',
        status: 'active',
        isFeatured: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }

      console.log('Generated short story:', shortStory.title)
      return shortStory
    } catch (fetchError) {
      console.error('Claude API fetch error:', fetchError)
      throw fetchError  // 外側のcatchブロックで処理
    }
  } catch (error) {
    console.error('小話生成エラー:', error)
    // エラー時のフォールバック小話
    return {
      title: `${new Date(reportData.reportDate).toLocaleDateString('ja-JP')}のサロンより`,
      content: `本日も温かいお客様との出会いがありました。${reportData.customerAttributes}のお客様が${reportData.visitReasonPurpose}ということでご来店され、心を込めて施術させていただきました。お客様の笑顔を見ることができ、私たちスタッフも幸せな気持ちになりました。`,
      sourceReportId: reportData.id,
      reportDate: reportData.reportDate,
      weatherInfo: reportData.weatherTemperature,
      customerType: reportData.customerAttributes,
      keyMoment: reportData.customerAfterTreatment,
      emotionalTone: 'heartwarming',
      status: 'active',
      isFeatured: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }
  }
}

// 2つの日報からブログを自動生成する関数
async function autoGenerateBlog() {
  try {
    console.log('📰 ブログ自動生成チェック開始...')

    // すべての日報を取得（日付降順）
    const allReportsSnapshot = await adminDb
      .collection('daily_reports')
      .orderBy('reportDate', 'desc')
      .get()

    const allReports = allReportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; reportDate?: string; [key: string]: any }>

    console.log(`📊 利用可能な日報: ${allReports.length}件`)

    if (allReports.length < 2) {
      console.log('⏸️  日報が2件未満のため、ブログ生成をスキップ')
      return null
    }

    // 既存のブログで使用済みの日付を取得
    const existingBlogsSnapshot = await adminDb
      .collection('blog_posts')
      .get()

    const usedDates = new Set<string>()
    existingBlogsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.newerDate) usedDates.add(data.newerDate)
      if (data.olderDate) usedDates.add(data.olderDate)
    })

    console.log(`📅 使用済み日付: ${usedDates.size}件`)

    // 未使用の日報を抽出
    const unusedReports = allReports.filter((report: any) =>
      !usedDates.has(report.reportDate) &&
      report.customerAttributes &&
      report.customerAttributes.trim() !== ''
    )

    console.log(`✅ 未使用の日報: ${unusedReports.length}件`)

    if (unusedReports.length < 2) {
      console.log('⏸️  未使用日報が2件未満のため、ブログ生成をスキップ')
      return null
    }

    // 最新の2件を取得
    const newerReport = unusedReports[0]
    const olderReport = unusedReports[1]

    console.log(`🤖 ブログ生成開始: ${newerReport.reportDate} と ${olderReport.reportDate}`)

    // Claude APIでブログ生成
    const reportPair = {
      newer: newerReport,
      older: olderReport
    }

    const generatedBlog = await callClaudeGenerateAPI(reportPair)
    console.log('✅ ブログ生成完了:', generatedBlog.title)

    // Claude APIで清書
    console.log('🎨 清書開始...')
    const cleanedBody = await callClaudeCleanAPI(generatedBlog.body)
    console.log('✅ 清書完了')

    // ブログをFirestoreに保存
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
    }

    const blogRef = adminDb.collection('blog_posts').doc()
    await blogRef.set({
      title: generatedBlog.title,
      slug: generateSlug(generatedBlog.title),
      summary: generatedBlog.summary,
      content: cleanedBody,
      newerDate: newerReport.reportDate,
      olderDate: olderReport.reportDate,
      status: 'published',
      publishedAt: FieldValue.serverTimestamp(),
      authorId: null,
      originalReportId: newerReport.id,
      tags: ['日報', '脱毛', '障害者専門'],
      excerpt: generatedBlog.summary,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

    const newBlog = {
      id: blogRef.id,
      title: generatedBlog.title,
      newerDate: newerReport.reportDate,
      olderDate: olderReport.reportDate
    }

    console.log('✅ ブログをFirestoreに保存しました:', newBlog.id)

    return newBlog
  } catch (error) {
    console.error('❌ ブログ自動生成エラー:', error)
    return null
  }
}

export async function GET() {
  try {
    console.log('📥 日報データをFirestoreから取得中...')

    const reportsSnapshot = await adminDb
      .collection('daily_reports')
      .orderBy('reportDate', 'desc')
      .get()

    // Firebaseのキャメルケースをフロントエンドのスネークケースに変換
    const reports = reportsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        staff_name: data.staffName,
        report_date: data.reportDate,
        weather_temperature: data.weatherTemperature || '',
        customer_attributes: data.customerAttributes || '',
        visit_reason_purpose: data.visitReasonPurpose || '',
        treatment_details: data.treatmentDetails || '',
        customer_before_treatment: data.customerBeforeTreatment || '',
        customer_after_treatment: data.customerAfterTreatment || '',
        salon_atmosphere: data.salonAtmosphere || '',
        insights_innovations: data.insightsInnovations || '',
        kanae_personal_thoughts: data.kanaePersonalThoughts || '',
        created_at: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updated_at: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      }
    })

    console.log('✅ 日報取得成功:', reports.length, '件')
    return NextResponse.json(reports)
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
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

    // 同じ日付の日報が既に存在するかチェック
    const existingReports = await adminDb
      .collection('daily_reports')
      .where('reportDate', '==', data.report_date)
      .get()

    if (!existingReports.empty) {
      console.log('⚠️ 同じ日付の日報が既に存在します:', data.report_date)
      return NextResponse.json(
        { error: `${data.report_date}の日報は既に登録されています。同じ日付の日報は1日1件までです。` },
        { status: 400 }
      )
    }

    console.log('💾 Firestoreに日報を保存中...')

    // Firestoreに日報を保存（キャメルケースに変換）
    const reportRef = adminDb.collection('daily_reports').doc()
    const reportData = {
      staffName: data.staff_name,
      reportDate: data.report_date,
      weatherTemperature: data.weather_temperature,
      customerAttributes: data.customer_attributes,
      visitReasonPurpose: data.visit_reason_purpose,
      treatmentDetails: data.treatment_details,
      customerBeforeTreatment: data.customer_before_treatment,
      customerAfterTreatment: data.customer_after_treatment,
      salonAtmosphere: data.salon_atmosphere,
      insightsInnovations: data.insights_innovations,
      kanaePersonalThoughts: data.kanae_personal_thoughts,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }

    await reportRef.set(reportData)

    const newReport = {
      id: reportRef.id,
      ...reportData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('✅ 日報をFirestoreに保存しました:', newReport.id)

    // 日報投稿後に小話を自動生成
    console.log('小話生成を開始します...')
    const generatedStory = await generateShortStory(newReport)

    if (generatedStory) {
      console.log('小話生成成功:', generatedStory.title)
    } else {
      console.log('小話生成失敗')
    }

    // 生成された小話をFirestoreに保存
    if (generatedStory) {
      console.log('💾 小話をFirestoreに保存中...')

      try {
        // 既存の小話のisFeaturedをfalseに更新
        const storiesSnapshot = await adminDb
          .collection('short_stories')
          .where('isFeatured', '==', true)
          .get()

        const batch = adminDb.batch()
        storiesSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, { isFeatured: false })
        })

        // 新しい小話を追加
        const storyRef = adminDb.collection('short_stories').doc()
        batch.set(storyRef, generatedStory)

        await batch.commit()

        console.log('✅ 小話をFirestoreに保存しました:', storyRef.id)
      } catch (saveError) {
        console.error('❌ 小話保存中に予期しないエラー:', saveError)
      }
    }

    // ブログ自動生成を試みる（未使用の日報が2件以上ある場合）
    console.log('📰 ブログ自動生成を試みます...')
    const generatedBlog = await autoGenerateBlog()

    if (generatedBlog) {
      console.log('✅ ブログが自動生成されました:', generatedBlog.title)
    } else {
      console.log('⏸️  ブログ生成条件が満たされていません')
    }

    const response = {
      report: newReport,
      generatedStory: generatedStory,
      generatedBlog: generatedBlog
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('日報作成エラー:', error)
    return NextResponse.json({ error: '日報の作成に失敗しました' }, { status: 500 })
  }
}
