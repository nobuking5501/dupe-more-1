import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

// 月次メッセージのデータ型
interface MonthlyMessage {
  id: string
  yearMonth: string
  message: string
  generatedAt: string
  sourceReportsCount: number
  status: 'active' | 'archived'
}

export async function GET() {
  try {
    // 現在の年月を取得 (YYYY-MM形式)
    const currentDate = new Date()
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

    console.log('📝 月次メッセージ取得開始 -', currentYearMonth)

    // 現在の月のアクティブなメッセージを取得
    const messagesSnapshot = await adminDb
      .collection('monthly_messages')
      .where('yearMonth', '==', currentYearMonth)
      .where('status', '==', 'active')
      .limit(1)
      .get()

    // 既存のメッセージがあれば返す
    if (!messagesSnapshot.empty) {
      const doc = messagesSnapshot.docs[0]
      const docData = doc.data() as any
      const existingMessage = {
        id: doc.id,
        ...docData,
        generatedAt: docData.generatedAt?.toDate().toISOString()
      }

      console.log('✅ 既存メッセージ返却')
      return NextResponse.json({
        data: existingMessage
      })
    }

    // メッセージが存在しない場合は生成を試行
    console.log('🤖 メッセージ生成を試行')
    const generatedMessage = await generateMonthlyMessage(currentYearMonth)

    if (generatedMessage) {
      return NextResponse.json({
        data: generatedMessage
      })
    }

    // 生成に失敗した場合は null を返す
    return NextResponse.json({
      data: null,
      message: 'メッセージを生成中です。しばらくお待ちください。'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    )
  }
}

// メッセージ生成用のPOSTエンドポイント（管理画面用）
export async function POST() {
  try {
    const currentDate = new Date()
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

    console.log('📝 メッセージ生成リクエスト -', currentYearMonth)

    const message = await generateMonthlyMessage(currentYearMonth)

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージの生成に失敗しました' },
        { status: 400 }
      )
    }

    console.log('✅ メッセージ生成成功')
    return NextResponse.json({
      data: message,
      message: 'メッセージを正常に生成しました'
    })

  } catch (error) {
    console.error('❌ Message generation error:', error)
    return NextResponse.json(
      { error: 'メッセージ生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

async function generateMonthlyMessage(yearMonth: string): Promise<MonthlyMessage | null> {
  try {
    // 前月と当月の日報データを取得
    const startDate = new Date(yearMonth + '-01')
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0) // 月末
    const prevMonthStart = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1) // 前月1日

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
      // デフォルトメッセージを作成
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
      status: 'active' as const,
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
    // 環境変数からAPIキーを取得
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not configured, using default message')
      return null
    }

    // 日報の内容を要約して準備
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

【月】: ${yearMonth}

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

async function createDefaultMessage(yearMonth: string): Promise<MonthlyMessage | null> {
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
      status: 'active' as const,
      generatedAt: new Date().toISOString()
    }

    return savedMessage

  } catch (error) {
    console.error('Error creating default message:', error)
    return null
  }
}
