import { TwitterApi } from 'twitter-api-v2'

/**
 * Twitter/X API クライアント
 * 140文字以内の小話を自動投稿する機能を提供
 */

// Twitter API認証情報チェック
function getTwitterClient(): TwitterApi | null {
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

  // 環境変数が設定されていない場合はnullを返す（エラーにしない）
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.log('⚠️ Twitter API認証情報が設定されていません。X投稿機能はスキップされます。')
    return null
  }

  try {
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    })

    return client
  } catch (error) {
    console.error('❌ Twitter APIクライアント初期化エラー:', error)
    return null
  }
}

/**
 * Xに小話を投稿する
 * @param text 投稿する文章（140文字以内推奨）
 * @returns 投稿の詳細情報（URL、ID等）、失敗時はnull
 */
export async function postToTwitter(text: string): Promise<{
  success: boolean
  tweetId?: string
  tweetUrl?: string
  error?: string
} | null> {
  try {
    const client = getTwitterClient()

    // 認証情報が無い場合は静かにスキップ
    if (!client) {
      console.log('ℹ️ Twitter API未設定のため、X投稿をスキップしました')
      return null
    }

    // 文字数チェック（280文字制限、ただし140文字推奨）
    if (text.length > 280) {
      console.error('❌ ツイート文字数が280文字を超えています:', text.length)
      return {
        success: false,
        error: `文字数オーバー: ${text.length}文字（上限280文字）`
      }
    }

    console.log('🐦 Xに投稿中...', text.substring(0, 50) + '...')

    // ツイート投稿
    const tweet = await client.v2.tweet(text)

    if (tweet.data) {
      const tweetId = tweet.data.id
      const tweetUrl = `https://twitter.com/i/web/status/${tweetId}`

      console.log('✅ X投稿成功:', tweetUrl)

      return {
        success: true,
        tweetId: tweetId,
        tweetUrl: tweetUrl
      }
    } else {
      console.error('❌ X投稿失敗: レスポンスにdataがありません')
      return {
        success: false,
        error: 'レスポンスが不正です'
      }
    }
  } catch (error: any) {
    console.error('❌ X投稿エラー:', error)

    // エラーの詳細をログに出力
    if (error.data) {
      console.error('エラー詳細:', JSON.stringify(error.data, null, 2))
    }

    return {
      success: false,
      error: error.message || '不明なエラー'
    }
  }
}

/**
 * Claude AIで140文字以内の小話を生成
 * @param reportData 日報データ
 * @returns 140文字以内の小話、失敗時はnull
 */
export async function generateTwitterShortStory(reportData: any): Promise<string | null> {
  try {
    const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY

    if (!CLAUDE_API_KEY) {
      console.error('❌ Claude API key not found')
      return null
    }

    const prompt = `
あなたは障害者専門脱毛サロン「Dupe&more」のスタッフとして、以下の日報データから、X（Twitter）投稿用の心温まる短い小話を生成してください。

# 日報データ
- 日付: ${reportData.reportDate}
- 天気: ${reportData.weatherTemperature}
- お客様: ${reportData.customerAttributes}
- 施術前: ${reportData.customerBeforeTreatment}
- 施術後: ${reportData.customerAfterTreatment}
- かなえの感想: ${reportData.kanaePersonalThoughts}

# 制約条件
- **文字数: 厳密に130文字以内**（ハッシュタグ用のスペース確保）
- 個人を特定できる情報は含めない
- 温かく、共感を呼ぶ内容
- 読んだ人が「いいね」したくなるような内容

# 文体
- です・ます調
- 親しみやすく自然な語り口
- 絵文字は使わない（テキストのみ）

以下のJSON形式で回答してください：
{
  "text": "130文字以内の投稿文"
}
`

    console.log('🤖 Claude AIで140文字小話を生成中...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Claude API error:', response.status, errorText)
      return null
    }

    const claudeResponse = await response.json()
    const generatedText = claudeResponse.content[0].text

    // JSONを抽出
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        const twitterText = data.text

        // 文字数チェック
        if (twitterText.length > 130) {
          console.warn('⚠️ 生成された文章が130文字を超えています:', twitterText.length, '文字')
          // 130文字に切り詰める
          return twitterText.substring(0, 127) + '...'
        }

        console.log('✅ 140文字小話生成成功:', twitterText.length, '文字')
        return twitterText
      }
    } catch (parseError) {
      console.error('❌ JSON解析エラー:', parseError)
    }

    // フォールバック: シンプルな小話を生成
    const fallbackText = `本日も${reportData.customerAttributes || 'お客様'}との温かい時間がありました。${reportData.customerAfterTreatment || '施術後の笑顔'}が何よりの喜びです。`
    console.log('ℹ️ フォールバック小話を使用:', fallbackText.length, '文字')
    return fallbackText.substring(0, 130)

  } catch (error) {
    console.error('❌ Twitter小話生成エラー:', error)
    return null
  }
}
