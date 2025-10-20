import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

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

async function generateShortStory(reportData: any) {
  console.log('Claude API小話生成開始 - 日付:', reportData.reportDate)

  try {
    const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY

    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not found')
    }

    const prompt = `
あなたは障害者専門脱毛サロン「Dupe&more」のスタッフ「かなえ」の視点で、
日報をもとに心温まる「小話」を生成してください。

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
      const fallbackContent = `${reportData.weatherTemperature}の日、${reportData.customerAttributes}のお客様がご来店されました。${reportData.visitReasonPurpose}ということで、心を込めて${reportData.treatmentDetails}をさせていただきました。${reportData.customerAfterTreatment}お客様の笑顔を見ることができ、私たちも温かい気持ちになりました。`
      storyData = {
        title: `${new Date(reportData.reportDate).toLocaleDateString('ja-JP')}の心温まる時間`,
        short_version: fallbackContent.substring(0, 200),
        full_version: fallbackContent,
        emotional_tone: 'heartwarming'
      }
    }

    return {
      title: storyData.title || `${new Date(reportData.reportDate).toLocaleDateString('ja-JP')}の心温まる時間`,
      content: storyData.full_version || storyData.content, // 長文版をメインコンテンツとして使用
      sourceReportId: reportData.id,
      reportDate: reportData.reportDate,
      weatherInfo: reportData.weatherTemperature,
      customerType: reportData.customerAttributes,
      keyMoment: reportData.customerAfterTreatment,
      emotionalTone: storyData.emotional_tone || 'heartwarming',
      status: 'active',
      isFeatured: true
    }
  } catch (error) {
    console.error('小話生成エラー:', error)
    await logMessage('error', '小話生成に失敗しました', { error: error instanceof Error ? error.message : "Unknown error", reportDate: reportData.reportDate })
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
    const reportsSnapshot = await adminDb
      .collection('daily_reports')
      .where('reportDate', '==', targetDate)
      .get()

    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; reportDate?: string; customerAttributes?: string; visitReasonPurpose?: string; [key: string]: any }>

    console.log('📊 クエリ結果:', {
      targetDate,
      reportCount: reports.length,
      reports: reports.map(r => ({ id: r.id, date: r.reportDate, hasCustomer: !!r.customerAttributes }))
    })

    if (reports.length === 0) {
      const errorMsg = `日報が見つかりません: ${targetDate}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    // 有効なデータがある日報を選択（空でないもの）
    const validReport = reports.find(report =>
      report.customerAttributes &&
      report.customerAttributes.trim() !== '' &&
      report.visitReasonPurpose &&
      report.visitReasonPurpose.trim() !== ''
    )

    if (!validReport) {
      const errorMsg = `有効な日報データが見つかりません: ${targetDate}`
      console.error('❌', errorMsg)
      await logMessage('error', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    const report = validReport

    // 既存の小話があるかチェック（冪等性） - 再生成のため一時的に無効化
    const existingStoriesSnapshot = await adminDb
      .collection('short_stories')
      .where('reportDate', '==', targetDate)
      .limit(1)
      .get()

    const existingStory = !existingStoriesSnapshot.empty ? {
      id: existingStoriesSnapshot.docs[0].id,
      title: existingStoriesSnapshot.docs[0].data().title
    } : null

    if (existingStory) {
      console.log('🔄 既存小話を新しいプロンプトで更新します:', existingStory.title)
      await logMessage('info', `小話再生成: ${existingStory.title}を更新`, { storyId: existingStory.id })
    }

    console.log('🤖 Claude APIで小話生成中...')
    const storyData = await generateShortStory(report)

    console.log('💾 Firestoreに小話を保存中...')

    // 他の小話のisFeaturedをfalseに更新
    const allStoriesSnapshot = await adminDb.collection('short_stories').get()
    const batch = adminDb.batch()
    allStoriesSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isFeatured: false })
    })
    await batch.commit()

    // 既存レコードがある場合は更新、ない場合は挿入
    let newStory: { id: string; title?: string; [key: string]: any }
    if (existingStory) {
      // 既存レコードを更新
      await adminDb
        .collection('short_stories')
        .doc(existingStory.id)
        .update({
          ...storyData,
          updatedAt: FieldValue.serverTimestamp()
        })

      const updatedDoc = await adminDb.collection('short_stories').doc(existingStory.id).get()
      newStory = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
      console.log('📝 既存レコードを更新しました:', existingStory.id)
    } else {
      // 新規レコードを挿入
      const storyRef = adminDb.collection('short_stories').doc()
      await storyRef.set({
        ...storyData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })

      newStory = {
        id: storyRef.id,
        ...storyData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      console.log('📝 新規レコードを挿入しました')
    }

    console.log('✅ 小話をFirestoreに保存しました:', newStory.id)
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
