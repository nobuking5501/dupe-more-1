import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

// 月頭の自動更新用エンドポイント
export async function POST() {
  try {
    console.log('Starting monthly message generation process...')

    const currentDate = new Date()
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

    // 既存のアクティブなメッセージがあるかチェック
    const existingMessageSnapshot = await adminDb
      .collection('monthly_messages')
      .where('yearMonth', '==', currentYearMonth)
      .where('status', '==', 'active')
      .limit(1)
      .get()

    if (!existingMessageSnapshot.empty) {
      console.log(`Message for ${currentYearMonth} already exists`)
      return NextResponse.json({
        success: true,
        message: `${currentYearMonth}のメッセージは既に存在します`,
        data: { yearMonth: currentYearMonth, action: 'skipped' }
      })
    }

    // 前月のメッセージをアーカイブ
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const prevYearMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`

    const prevMessagesSnapshot = await adminDb
      .collection('monthly_messages')
      .where('yearMonth', '==', prevYearMonth)
      .where('status', '==', 'active')
      .get()

    const batch = adminDb.batch()
    prevMessagesSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'archived', updatedAt: FieldValue.serverTimestamp() })
    })
    await batch.commit()

    console.log(`Archived previous month message: ${prevYearMonth}`)

    // 新しいメッセージを生成
    const generatedMessage = await generateMonthlyMessage(currentYearMonth)

    if (!generatedMessage) {
      return NextResponse.json({
        success: false,
        error: 'メッセージ生成に失敗しました'
      }, { status: 500 })
    }

    console.log(`Successfully generated message for ${currentYearMonth}`)

    return NextResponse.json({
      success: true,
      message: `${currentYearMonth}のメッセージを正常に生成しました`,
      data: generatedMessage
    })

  } catch (error) {
    console.error('Monthly message generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'メッセージ生成中にエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 現在の月のメッセージ生成状況をチェック
export async function GET() {
  try {
    const currentDate = new Date()
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

    const messageSnapshot = await adminDb
      .collection('monthly_messages')
      .where('yearMonth', '==', currentYearMonth)
      .where('status', '==', 'active')
      .limit(1)
      .get()

    const message = !messageSnapshot.empty ? {
      id: messageSnapshot.docs[0].id,
      ...(messageSnapshot.docs[0].data() as any),
      generatedAt: (messageSnapshot.docs[0].data() as any).generatedAt?.toDate().toISOString()
    } : null

    return NextResponse.json({
      currentMonth: currentYearMonth,
      messageExists: !!message,
      nextGenerationDate: getNextGenerationDate(),
      message: message || null
    })

  } catch (error) {
    console.error('Error checking message status:', error)
    return NextResponse.json({
      error: 'メッセージ状況の確認中にエラーが発生しました'
    }, { status: 500 })
  }
}

function getNextGenerationDate(): string {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.toISOString().split('T')[0]
}

async function generateMonthlyMessage(yearMonth: string) {
  try {
    // 前月と当月の日報データを取得
    const startDate = new Date(yearMonth + '-01')
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
    const prevMonthStart = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1)

    const prevMonthStartStr = prevMonthStart.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const reportsSnapshot = await adminDb
      .collection('daily_reports')
      .where('reportDate', '>=', prevMonthStartStr)
      .where('reportDate', '<=', endDateStr)
      .orderBy('reportDate', 'desc')
      .limit(20)
      .get()

    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }))

    if (reports.length === 0) {
      return await createDefaultMessage(yearMonth)
    }

    // Claude APIを使用してメッセージを生成
    const generatedMessage = await generateMessageWithClaude(reports, yearMonth)

    if (!generatedMessage) {
      return await createDefaultMessage(yearMonth)
    }

    // データベースに保存
    const messageRef = adminDb.collection('monthly_messages').doc()
    await messageRef.set({
      yearMonth: yearMonth,
      message: generatedMessage,
      sourceReportsCount: reports.length,
      status: 'active',
      generatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

    const savedMessage = {
      id: messageRef.id,
      yearMonth: yearMonth,
      message: generatedMessage,
      sourceReportsCount: reports.length,
      status: 'active',
      generatedAt: new Date().toISOString()
    }

    return savedMessage

  } catch (error) {
    console.error('Error in generateMonthlyMessage:', error)
    return null
  }
}

async function generateMessageWithClaude(reports: any[], yearMonth: string): Promise<string | null> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not configured, using default message')
      return null
    }

    const reportSummaries = reports.map(report => ({
      date: report.reportDate,
      staffName: report.staffName,
      customerAttributes: report.customerAttributes || '',
      visitReasonPurpose: report.visitReasonPurpose || '',
      customerAfterTreatment: report.customerAfterTreatment || '',
      kanaePersonalThoughts: report.kanaePersonalThoughts || ''
    }))

    const prompt = `
あなたは障害者専門脱毛サロン「Dupe&more」のスタッフです。
以下のスタッフの日報を基に、障害をお持ちのお子様の保護者様に向けた温かいメッセージを作成してください。

【日報データ】
${reportSummaries.map(report =>
      `${report.date} (${report.staffName}):
   お客様の属性: ${report.customerAttributes}
   来店のきっかけ・目的: ${report.visitReasonPurpose}
   施術後のお客様の反応: ${report.customerAfterTreatment}
   かなえの感想: ${report.kanaePersonalThoughts}`
    ).join('\n\n')}

【要件】
- 200-300文字程度
- 保護者様の気持ちに寄り添う温かい内容
- お子様の成長への願いを込める
- 感覚特性への配慮について触れる
- 安心感を与える表現を使用
- 丁寧で親しみやすい文体
- 具体的なエピソードは含めず、一般的な内容にする

【対象月】: ${yearMonth}

メッセージのみを出力してください（他の説明は不要です）。
`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      console.error('Claude API error:', response.statusText)
      return null
    }

    const data = await response.json()

    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text.trim()
    }

    return null

  } catch (error) {
    console.error('Error calling Claude API:', error)
    return null
  }
}

async function createDefaultMessage(yearMonth: string) {
  try {
    const defaultMessage = `いつもDupe&moreをご利用いただき、ありがとうございます。

お子様一人ひとりの感覚特性を大切にし、安心してお過ごしいただける環境づくりを心がけております。スタッフ一同、お子様のペースに合わせた丁寧なケアを提供し、小さな成長も見逃さずにサポートしてまいります。

保護者様におかれましても、何かご心配なことやご質問がございましたら、いつでもお気軽にお声かけください。お子様の笑顔が私たちの何よりの励みです。今月もどうぞよろしくお願いいたします。`

    const messageRef = adminDb.collection('monthly_messages').doc()
    await messageRef.set({
      yearMonth: yearMonth,
      message: defaultMessage,
      sourceReportsCount: 0,
      status: 'active',
      generatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

    const savedMessage = {
      id: messageRef.id,
      yearMonth: yearMonth,
      message: defaultMessage,
      sourceReportsCount: 0,
      status: 'active',
      generatedAt: new Date().toISOString()
    }

    return savedMessage

  } catch (error) {
    console.error('Error creating default message:', error)
    return null
  }
}
