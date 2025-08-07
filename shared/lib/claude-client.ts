import Anthropic from '@anthropic-ai/sdk'
import { ClaudeGenerationRequest, ClaudeGenerationResponse } from '../types'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
})

export class ClaudeService {
  async generateBlogPost(request: ClaudeGenerationRequest): Promise<ClaudeGenerationResponse> {
    const prompt = this.buildPrompt(request)
    
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = completion.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude API')
      }

      return this.parseResponse(content.text)
    } catch (error) {
      console.error('Claude API Error:', error)
      throw new Error('ブログ記事の生成に失敗しました')
    }
  }

  private buildPrompt(request: ClaudeGenerationRequest): string {
    const targetLength = request.targetLength || 1500
    const tone = request.tone || 'professional'
    
    return `
あなたは脱毛サロン「Dupe＆more（デュープアンドモア）」のブログライターです。
障害を持つお子さまとご家族が安心して通える、やさしい脱毛サロンとして運営しています。

以下のスタッフの日報をもとに、ブログ記事を作成してください。

【日報内容】
${request.dailyReport}

【要件】
- 文字数: ${targetLength}文字程度
- トーン: ${tone === 'professional' ? '専門的で信頼できる' : tone === 'friendly' ? 'フレンドリーで親しみやすい' : 'カジュアルで読みやすい'}
- 読者: 障害を持つお子さまの保護者の方々
- 目的: サロンの雰囲気や専門性、安心感を伝える

【出力形式】
以下のJSON形式で出力してください:
{
  "title": "ブログタイトル（30文字以内）",
  "content": "本文（HTML形式、段落は<p>タグで区切る）",
  "excerpt": "記事の要約（100文字以内）",
  "suggestedTags": ["タグ1", "タグ2", "タグ3"]
}

注意: JSON以外の文字は出力しないでください。
`
  }

  private parseResponse(response: string): ClaudeGenerationResponse {
    try {
      // JSONの開始と終了を見つける
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('JSON形式の応答が見つかりません')
      }
      
      const jsonString = response.slice(jsonStart, jsonEnd)
      const parsed = JSON.parse(jsonString)
      
      return {
        title: parsed.title || 'タイトルなし',
        content: parsed.content || '',
        excerpt: parsed.excerpt || '',
        suggestedTags: parsed.suggestedTags || []
      }
    } catch (error) {
      console.error('Response parsing error:', error)
      throw new Error('Claude APIからの応答の解析に失敗しました')
    }
  }
}