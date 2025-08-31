import OpenAI from 'openai'

// Claude API client setup using OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.anthropic.com/v1',
  defaultHeaders: {
    'anthropic-version': '2023-06-01',
  },
})

export interface DailyReportSummary {
  staff_name: string
  report_date: string
  client_interactions?: string
  observations?: string
  challenges?: string
  successes?: string
  feelings?: string
}

export async function generateMonthlyMessage(reports: DailyReportSummary[]): Promise<string> {
  const reportsText = reports.map(report => `
【${report.report_date} - ${report.staff_name}】
お客様との関わり: ${report.client_interactions || '記録なし'}
気づき・観察: ${report.observations || '記録なし'}
困難だった点: ${report.challenges || '記録なし'}
うまくいった点: ${report.successes || '記録なし'}
スタッフの感想: ${report.feelings || '記録なし'}
`).join('\n')

  const prompt = `
以下は障害を持つお子様を専門とする脱毛サロンのスタッフ日報です。
これらの日報から、保護者様に向けた心温まる月次メッセージを作成してください。

【日報データ】
${reportsText}

【作成指示】
1. 障害を持つお子様とその保護者様への理解と共感を示す内容
2. スタッフの成長や気づき、お子様への愛情を伝える
3. 感覚特性への配慮や個別対応の重要性について触れる
4. 保護者様への感謝の気持ちを込める
5. 200-300文字程度の読みやすい長さ
6. 温かく、希望に満ちた前向きなトーン
7. 具体的なエピソードがあれば自然に織り込む

【避けるべき表現】
- 医療的な助言や診断的な内容
- 過度に感情的すぎる表現
- 特定のお客様を特定できる詳細情報

障害者支援の専門知識を持つ脱毛サロンスタッフとして、保護者様の心に寄り添うメッセージを作成してください。
`

  try {
    const response = await client.chat.completions.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || '申し訳ございません。メッセージの生成に失敗しました。'
  } catch (error) {
    console.error('Claude API Error:', error)
    
    // フォールバックメッセージ
    return `いつも温かいご理解とご協力をありがとうございます。

この一ヶ月間、スタッフ一同、お子様一人ひとりの個性と感覚特性に寄り添いながら、丁寧なケアを心がけてまいりました。

お子様たちの「また来るね」という言葉や、安心した表情を見せてくれる瞬間が、私たちの何よりの励みとなっています。感覚過敏や不安を感じられるお子様にも、その日の体調やペースに合わせて、無理のない施術を提供できるよう努めております。

保護者様のご理解とサポートがあってこそ、お子様が安心して通えるサロンでありつづけることができます。今後もお子様の成長を温かく見守りながら、ご家族とともに歩んでまいります。`
  }
}

export async function testClaudeConnection(): Promise<boolean> {
  try {
    const response = await client.chat.completions.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Hello, please respond with "Connection successful"'
        }
      ],
    })

    return response.choices[0]?.message?.content?.includes('successful') || false
  } catch (error) {
    console.error('Claude API connection test failed:', error)
    return false
  }
}