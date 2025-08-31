/**
 * Claude清書専用API呼び出し機能
 * 本文を20-25文字改行ルールで整形
 */

interface CleanRequest {
  body: string
}

interface CleanResponse {
  cleanedBody: string
}

export async function callClaudeCleanAPI(body: string): Promise<string> {
  const CLAUDE_CLEAN_KEY = process.env.CLAUDE_CLEAN_KEY
  
  if (!CLAUDE_CLEAN_KEY) {
    throw new Error('CLAUDE_CLEAN_KEY環境変数が設定されていません')
  }

  const systemPrompt = `あなたは清書専用アシスタントです。
本文を次のルールで厳密に整形します：

【必須ルール】
1. 1文を3〜4行に分割し、行末で改行＋改行直後に半角空白1つ
2. 各行は20〜25文字で改行（句読点優先、語中分割は避ける）
3. 見出し（##）、要約、JSON構造は変更しない
4. 本文のみを整形対象とする

【例】
入力：障害があっても綺麗になりたい気持ちは同じです。お母さんとしてその想いを大切にしたい。
出力：
 障害があっても
 綺麗になりたい
 気持ちは同じです。

 お母さんとして
 その想いを
 大切にしたい。

整形済み本文のみを返してください。`

  const userPrompt = `以下の本文を20-25文字改行ルールで整形してください：

${body}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_CLEAN_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${systemPrompt}\n\n${userPrompt}`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Claude Clean API error: ${response.status} ${errorText}`)
    }

    const claudeResponse = await response.json()
    const cleanedBody = claudeResponse.content[0].text

    console.log('清書完了 - 元文字数:', body.length, '→ 整形後文字数:', cleanedBody.length)
    
    return cleanedBody
  } catch (error) {
    console.error('清書API呼び出しエラー:', error)
    throw error
  }
}