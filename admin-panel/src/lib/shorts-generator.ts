import { ClaudeClient } from './claude-client'
import { ShortsService, SafeSummary, ShortDraft, AuditResult } from './shorts-service'
import { logger } from './logger'

export class ShortsGenerator {
  private static claudeClient = new ClaudeClient()

  /**
   * Stage A: Sanitize/Normalize - 正規化
   * 日報から公開可能な安全な要約を作成
   */
  static async sanitizeReports(reports: any[]): Promise<SafeSummary[]> {
    const startTime = Date.now()
    
    try {
      logger.info('SHORTS_GENERATOR', 'Starting report sanitization', { reportCount: reports.length })
      
      const prompt = `
役割: コンテンツ監査官
目的: スタッフ日報から公開可能な短い要約を作成する

要件:
- PII除去（人名/学校/詳細地名/疾患名/連絡先などは一般化）
- 配慮語置換（例:「障害者」→「お客さま」「健常者」→「一般の方」）
- 障害特性に関する表現は「特性」「個別のニーズ」として一般化
- 断定/比較/誇大は緩和
- 1件あたり 80〜120字、配慮→支援の順

入力データ:
${JSON.stringify(reports.map(r => ({ id: r.id, content: r.content, date: r.date })))}

出力形式（必ずJSON配列で返してください）:
[
  {
    "report_id": "レポートID",
    "safe_summary": "80-120字の安全な要約",
    "flags": ["除去したPII要素", "修正した表現"]
  }
]
`

      const response = await this.claudeClient.generateContent({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      })

      // Log the generation
      await ShortsService.logGeneration({
        stage: 'sanitize',
        status: 'success',
        elapsed_ms: Date.now() - startTime,
        model_name: 'claude-3-sonnet',
        input_data: { reports: reports.map(r => ({ id: r.id, length: r.content?.length })) },
        output_data: { response: response?.slice(0, 500) }
      })

      // Parse JSON response
      const jsonMatch = response?.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response')
      }

      const summaries: SafeSummary[] = JSON.parse(jsonMatch[0])
      
      logger.info('SHORTS_GENERATOR', 'Report sanitization completed', { 
        summaryCount: summaries.length,
        elapsedMs: Date.now() - startTime 
      })

      return summaries
    } catch (error) {
      const elapsedMs = Date.now() - startTime
      logger.error('SHORTS_GENERATOR', 'Report sanitization failed', { error, elapsedMs })
      
      await ShortsService.logGeneration({
        stage: 'sanitize',
        status: 'error',
        elapsed_ms: elapsedMs,
        error_message: error instanceof Error ? error.message : String(error)
      })

      throw error
    }
  }

  /**
   * Stage B: Draft - 小話草案作成
   * 正規化された要約から小話を生成
   */
  static async createDraft(summaries: SafeSummary[]): Promise<ShortDraft> {
    const startTime = Date.now()
    
    try {
      logger.info('SHORTS_GENERATOR', 'Starting draft creation', { summaryCount: summaries.length })

      const prompt = `
役割: 広報ライター（障害者専門脱毛サロン Dupe&more）
目的: 日報から障害者支援の心温まる小話を作成

サロンの特徴:
- 障害者・特別支援が必要な方専門の脱毛サロン
- 一人ひとりの身体的・感覚的特性に合わせた丁寧な対応
- スタッフ1名での個別対応による安心できる環境
- 通常のサロンでは対応困難な配慮が必要な方をサポート

要件:
- タイトル: 20字以内
- 本文: 150〜250字、構成は「配慮→支援→小さな成長」
- 禁則: 個人特定、医療断定、比較広告、誇大表現
- 推奨語感: 「一人ひとりに」「寄り添って」「ゆっくりと」「安心して」「特性に合わせて」

入力要約:
${summaries.map((s, i) => `${i+1}. ${s.safe_summary}`).join('\n')}

出力形式（必ずJSONで返してください）:
{
  "title": "20字以内のタイトル",
  "body_md": "150-250字の本文（マークダウン形式可）",
  "tags": ["個別支援", "安心", "寄り添い", "成長", "配慮"]
}
`

      const response = await this.claudeClient.generateContent({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })

      // Log the generation
      await ShortsService.logGeneration({
        stage: 'draft',
        status: 'success',
        elapsed_ms: Date.now() - startTime,
        model_name: 'claude-3-sonnet',
        input_data: { summaries },
        output_data: { response: response?.slice(0, 500) }
      })

      // Parse JSON response
      const jsonMatch = response?.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response')
      }

      const draft: ShortDraft = JSON.parse(jsonMatch[0])

      // Validate length requirements
      if (draft.title.length > 20) {
        throw new Error(`Title too long: ${draft.title.length} characters`)
      }
      if (draft.body_md.length < 150 || draft.body_md.length > 250) {
        throw new Error(`Body length invalid: ${draft.body_md.length} characters`)
      }

      logger.info('SHORTS_GENERATOR', 'Draft creation completed', { 
        titleLength: draft.title.length,
        bodyLength: draft.body_md.length,
        elapsedMs: Date.now() - startTime 
      })

      return draft
    } catch (error) {
      const elapsedMs = Date.now() - startTime
      logger.error('SHORTS_GENERATOR', 'Draft creation failed', { error, elapsedMs })
      
      await ShortsService.logGeneration({
        stage: 'draft',
        status: 'error',
        elapsed_ms: elapsedMs,
        error_message: error instanceof Error ? error.message : String(error)
      })

      throw error
    }
  }

  /**
   * Stage C: Audit - 監査
   * 小話草案のリスク検査と安全化
   */
  static async auditDraft(draft: ShortDraft): Promise<AuditResult> {
    const startTime = Date.now()
    
    try {
      logger.info('SHORTS_GENERATOR', 'Starting draft audit', { draft })

      const prompt = `
役割: 品質監査官
目的: 小話草案のリスクを検出し安全化する

チェック項目:
- PII（個人識別情報）: 人名、学校名、詳細地名、疾患名、連絡先
- 断定表現: 医療効果の断定
- 比較広告: 他社との比較
- 誇大表現: 過度な効果の表現

草案:
タイトル: ${draft.title}
本文: ${draft.body_md}
タグ: ${draft.tags.join(', ')}

出力形式（必ずJSONで返してください）:
{
  "pii_risk_score": 0-100の数値,
  "issues_found": ["発見された問題のリスト"],
  "ok_version_md": "修正版本文（問題がある場合のみ）",
  "recommended_status": "published" または "pending_review"
}
`

      const response = await this.claudeClient.generateContent({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
      })

      // Log the generation
      await ShortsService.logGeneration({
        stage: 'audit',
        status: 'success',
        elapsed_ms: Date.now() - startTime,
        model_name: 'claude-3-sonnet',
        input_data: { draft },
        output_data: { response: response?.slice(0, 500) }
      })

      // Parse JSON response
      const jsonMatch = response?.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response')
      }

      const auditResult: AuditResult = JSON.parse(jsonMatch[0])

      logger.info('SHORTS_GENERATOR', 'Draft audit completed', { 
        riskScore: auditResult.pii_risk_score,
        issueCount: auditResult.issues_found.length,
        elapsedMs: Date.now() - startTime 
      })

      return auditResult
    } catch (error) {
      const elapsedMs = Date.now() - startTime
      logger.error('SHORTS_GENERATOR', 'Draft audit failed', { error, elapsedMs })
      
      await ShortsService.logGeneration({
        stage: 'audit',
        status: 'error',
        elapsed_ms: elapsedMs,
        error_message: error instanceof Error ? error.message : String(error)
      })

      throw error
    }
  }

  /**
   * Stage D: Publish - 公開処理
   * 監査結果に基づいて自動公開またはレビュー待ちに設定
   */
  static async publishOrQueue(
    draft: ShortDraft, 
    auditResult: AuditResult, 
    sourceReportIds: string[]
  ): Promise<{ shortId: string; status: 'published' | 'pending_review' }> {
    const startTime = Date.now()
    
    try {
      logger.info('SHORTS_GENERATOR', 'Starting publish process', { 
        riskScore: auditResult.pii_risk_score,
        recommendedStatus: auditResult.recommended_status 
      })

      // Use the corrected version if available
      const finalBodyMd = auditResult.ok_version_md || draft.body_md
      
      // Determine final status based on risk score and recommendation
      const finalStatus = auditResult.pii_risk_score <= 20 && auditResult.recommended_status === 'published' 
        ? 'published' 
        : 'pending_review'

      // Create the short
      const shortData = {
        title: draft.title,
        body_md: finalBodyMd,
        tags: draft.tags,
        status: finalStatus,
        pii_risk_score: auditResult.pii_risk_score,
        source_report_ids: sourceReportIds,
        ...(finalStatus === 'published' && { published_at: new Date().toISOString() })
      }

      const { data: short, error } = await ShortsService.createShort(shortData)
      
      if (error || !short) {
        throw new Error(`Failed to create short: ${error?.message || 'Unknown error'}`)
      }

      // Log the publication
      await ShortsService.logGeneration({
        short_id: short.id,
        stage: 'publish',
        status: 'success',
        elapsed_ms: Date.now() - startTime,
        output_data: { shortId: short.id, finalStatus }
      })

      // Trigger ISR revalidation if published
      if (finalStatus === 'published') {
        try {
          const revalidateUrl = process.env.NEXT_PUBLIC_SITE_URL + '/api/revalidate'
          const revalidateSecret = process.env.REVALIDATE_SECRET
          
          if (revalidateUrl && revalidateSecret) {
            const revalidateResponse = await fetch(revalidateUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${revalidateSecret}`
              },
              body: JSON.stringify({
                type: 'short_auto_published',
                paths: ['/', '/shorts', '/sitemap.xml']
              })
            })
            
            if (revalidateResponse.ok) {
              logger.info('SHORTS_GENERATOR', 'ISR revalidation triggered for auto-published short', { shortId: short.id })
            } else {
              logger.warn('SHORTS_GENERATOR', 'ISR revalidation failed for auto-published short', { 
                shortId: short.id, 
                status: revalidateResponse.status 
              })
            }
          }
        } catch (error) {
          logger.error('SHORTS_GENERATOR', 'ISR revalidation error for auto-published short', { shortId: short.id, error })
          // Don't fail the main operation if revalidation fails
        }
      }

      logger.info('SHORTS_GENERATOR', 'Publish process completed', { 
        shortId: short.id,
        finalStatus,
        elapsedMs: Date.now() - startTime 
      })

      return { shortId: short.id, status: finalStatus }
    } catch (error) {
      const elapsedMs = Date.now() - startTime
      logger.error('SHORTS_GENERATOR', 'Publish process failed', { error, elapsedMs })
      
      await ShortsService.logGeneration({
        stage: 'publish',
        status: 'error',
        elapsed_ms: elapsedMs,
        error_message: error instanceof Error ? error.message : String(error)
      })

      throw error
    }
  }

  /**
   * Full Pipeline: A → B → C → D
   * 日報から小話まで全ステージを実行
   */
  static async generateFromReports(reports: any[]): Promise<{ shortId: string; status: 'published' | 'pending_review' }> {
    try {
      logger.info('SHORTS_GENERATOR', 'Starting full generation pipeline', { reportCount: reports.length })

      // Stage A: Sanitize
      const summaries = await this.sanitizeReports(reports)

      // Stage B: Draft
      const draft = await this.createDraft(summaries)

      // Stage C: Audit
      const auditResult = await this.auditDraft(draft)

      // Stage D: Publish
      const result = await this.publishOrQueue(
        draft, 
        auditResult, 
        reports.map(r => r.id)
      )

      logger.info('SHORTS_GENERATOR', 'Full generation pipeline completed', { 
        shortId: result.shortId,
        finalStatus: result.status 
      })

      return result
    } catch (error) {
      logger.error('SHORTS_GENERATOR', 'Full generation pipeline failed', { error })
      throw error
    }
  }

  /**
   * Daily Generation Check
   * 今日の小話が未作成なら自動生成
   */
  static async generateDailyShort(): Promise<{ shortId?: string; status?: 'published' | 'pending_review'; message: string }> {
    try {
      // Check if today's short already exists
      const { data: todaysShort } = await ShortsService.getTodaysShort()
      
      if (todaysShort) {
        logger.info('SHORTS_GENERATOR', 'Today\'s short already exists', { shortId: todaysShort.id })
        return { 
          shortId: todaysShort.id, 
          status: todaysShort.status, 
          message: 'Today\'s short already exists' 
        }
      }

      // Get latest daily reports
      const { data: reports } = await ShortsService.getLatestDailyReports(3)
      
      if (!reports || reports.length === 0) {
        logger.warn('SHORTS_GENERATOR', 'No daily reports found for generation')
        return { message: 'No daily reports available for generation' }
      }

      // Generate short from reports
      const result = await this.generateFromReports(reports)
      
      return {
        shortId: result.shortId,
        status: result.status,
        message: 'Daily short generated successfully'
      }
    } catch (error) {
      logger.error('SHORTS_GENERATOR', 'Daily short generation failed', { error })
      throw error
    }
  }
}