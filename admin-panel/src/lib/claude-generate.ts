/**
 * Claude生成専用API呼び出し機能
 * 2日誌→1記事または12日誌→6記事の生成フェーズ
 */

interface ReportPair {
  newer: any
  older: any
}

interface BlogGenerationResult {
  title: string
  summary: string
  outline: string[]
  body: string
  diagnostics: {
    length_ok: boolean
    linewrap_ok: boolean
    safe_language: boolean
  }
}

export async function callClaudeGenerateAPI(reportPair: ReportPair, useKey2 = false): Promise<BlogGenerationResult> {
  // 小話生成と同じAPIキーを使用（動作確認済み）
  const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY

  if (!CLAUDE_KEY) {
    throw new Error('ANTHROPIC_API_KEY環境変数が設定されていません')
  }

  const systemPrompt = `あなたは、障害者専門サロン「Dupe & More」の編集責任者です。
与えられた「日誌2件（ペア）」から、障害のあるお子さまの保護者に
"読みやすく、感情に届く"ブログ記事を安全に生成してください。

【必須条件】
- タイトル：10〜24文字、感情に響くが誇大でない。
- 本文：約2000字（±10%）、H2見出しをちょうど4本。
- 見出しは Markdown 形式で「## ○○」。
- 清書規則は生成後に別フェーズ（CLAUDE_CLEAN_KEY）で適用する。
- 絵文字・装飾記号は禁止。日本語・ですます調。
- 内容は「共感→配慮→前進→初めての方へ」の流れ。

【出力仕様】
JSON 形式：
{
  "title": "…",
  "summary": "120〜160字。本文を読むメリットを静かに示す要約",
  "outline": ["共感：…","配慮：…","前進：…","初めての方へ：…"],
  "body": "## 共感：...\\n本文（清書前の段落）…\\n\\n## 配慮：...\\n…\\n\\n## 前進：...\\n…\\n\\n## 初めての方へ：...\\n…",
  "diagnostics": {"length_ok":true,"linewrap_ok":false,"safe_language":true}
}`

  const userPrompt = `# 入力：日誌ペア JSON
report_pair = ${JSON.stringify(reportPair, null, 2)}

# タスク
1) date 昇順に並べる。
2) それぞれ 80〜120字で PII 一般化＆要約（内部分析）。
3) 保護者に刺さる核テーマを抽出。
4) 見出し4本のプロットを立て、約2000字で執筆。
5) JSON で出力（清書は後工程で行うため未整形で可）。`

  try {
    console.log(`Claude生成API呼び出し開始 (${useKey2 ? 'KEY2' : 'KEY1'})`)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 6000,
        temperature: 0.3,
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
      throw new Error(`Claude Generate API error: ${response.status} ${errorText}`)
    }

    const claudeResponse = await response.json()
    const generatedText = claudeResponse.content[0].text
    
    console.log('Claude生成API応答受信 - 文字数:', generatedText.length)

    // JSONを抽出して解析
    let blogData
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        // 制御文字を除去してからJSONをパース
        const cleanedJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '')
        blogData = JSON.parse(cleanedJson)
      } else {
        throw new Error('JSON not found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Generated text:', generatedText.substring(0, 500) + '...')
      throw new Error('ブログ生成結果のJSONパースに失敗しました')
    }

    return blogData
  } catch (error) {
    console.error('生成API呼び出しエラー:', error)
    throw error
  }
}

export async function callClaudeGenerateBulkAPI(reportPairs: ReportPair[]): Promise<BlogGenerationResult[]> {
  const results: BlogGenerationResult[] = []
  
  // 6記事を並行生成（API制限を考慮して3つずつに分割）
  const batches = [
    reportPairs.slice(0, 3),
    reportPairs.slice(3, 6)
  ]
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]
    const batchPromises = batch.map((pair, index) => 
      callClaudeGenerateAPI(pair, (batchIndex * 3 + index) % 2 === 1) // KEY1とKEY2を交互使用
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // バッチ間で少し待機
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  return results
}