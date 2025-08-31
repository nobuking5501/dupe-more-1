import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 月頭の自動更新用エンドポイント
export async function POST() {
  try {
    console.log('Starting monthly message generation process...')
    
    const currentDate = new Date()
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    // 既存のアクティブなメッセージがあるかチェック
    const { data: existingMessage } = await supabase
      .from('monthly_messages')
      .select('id')
      .eq('year_month', currentYearMonth)
      .eq('status', 'active')
      .single()
    
    if (existingMessage) {
      console.log(`Message for ${currentYearMonth} already exists`)
      return NextResponse.json({
        success: true,
        message: `${currentYearMonth}のメッセージは既に存在します`,
        data: { year_month: currentYearMonth, action: 'skipped' }
      })
    }
    
    // 前月のメッセージをアーカイブ
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const prevYearMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
    
    await supabase
      .from('monthly_messages')
      .update({ status: 'archived' })
      .eq('year_month', prevYearMonth)
      .eq('status', 'active')
    
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
    
    const { data: message } = await supabase
      .from('monthly_messages')
      .select('*')
      .eq('year_month', currentYearMonth)
      .eq('status', 'active')
      .single()
    
    return NextResponse.json({
      current_month: currentYearMonth,
      message_exists: !!message,
      next_generation_date: getNextGenerationDate(),
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
    
    const { data: reports, error: reportsError } = await supabase
      .from('daily_reports')
      .select('*')
      .gte('report_date', prevMonthStart.toISOString().split('T')[0])
      .lte('report_date', endDate.toISOString().split('T')[0])
      .order('report_date', { ascending: false })
      .limit(20)
    
    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      return null
    }
    
    if (!reports || reports.length === 0) {
      return await createDefaultMessage(yearMonth)
    }
    
    // Claude APIを使用してメッセージを生成
    const generatedMessage = await generateMessageWithClaude(reports, yearMonth)
    
    if (!generatedMessage) {
      return await createDefaultMessage(yearMonth)
    }
    
    // データベースに保存
    const { data: savedMessage, error: saveError } = await supabase
      .from('monthly_messages')
      .insert({
        year_month: yearMonth,
        message: generatedMessage,
        source_reports_count: reports.length,
        status: 'active'
      })
      .select()
      .single()
    
    if (saveError) {
      console.error('Error saving message:', saveError)
      return null
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
      date: report.report_date,
      staff_name: report.staff_name,
      client_interactions: report.client_interactions || '',
      observations: report.observations || '',
      successes: report.successes || '',
      feelings: report.feelings || ''
    }))
    
    const prompt = `
あなたは障害者専門脱毛サロン「Dupe&more」のスタッフです。
以下のスタッフの日報を基に、障害をお持ちのお子様の保護者様に向けた温かいメッセージを作成してください。

【日報データ】
${reportSummaries.map(report => 
  `${report.date} (${report.staff_name}):
   お客様との関わり: ${report.client_interactions}
   観察・気づき: ${report.observations}
   成功体験: ${report.successes}
   スタッフの想い: ${report.feelings}`
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

    const { data: savedMessage, error: saveError } = await supabase
      .from('monthly_messages')
      .insert({
        year_month: yearMonth,
        message: defaultMessage,
        source_reports_count: 0,
        status: 'active'
      })
      .select()
      .single()
    
    if (saveError) {
      console.error('Error saving default message:', saveError)
      return null
    }
    
    return savedMessage
    
  } catch (error) {
    console.error('Error creating default message:', error)
    return null
  }
}