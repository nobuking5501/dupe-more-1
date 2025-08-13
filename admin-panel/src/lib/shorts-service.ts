import { supabaseAdmin } from './supabase-client'
import { logger } from './logger'

export interface Short {
  id: string
  title: string
  body_md: string
  tags: string[]
  status: 'draft' | 'pending_review' | 'published'
  pii_risk_score: number
  source_report_ids: string[]
  created_at: string
  published_at?: string
  updated_at: string
}

export interface GenerationLog {
  id: string
  short_id?: string
  stage: 'sanitize' | 'draft' | 'audit' | 'publish' | 'test_generate'
  status: 'success' | 'error' | 'retry'
  elapsed_ms?: number
  model_name?: string
  tokens_used?: number
  input_data?: any
  output_data?: any
  error_message?: string
  created_at: string
  metadata?: any
}

export interface SafeSummary {
  report_id: string
  safe_summary: string
  flags: string[]
}

export interface ShortDraft {
  title: string
  body_md: string
  tags: string[]
}

export interface AuditResult {
  pii_risk_score: number
  issues_found: string[]
  ok_version_md?: string
  recommended_status: 'published' | 'pending_review'
}

function ensureAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.')
  }
  return supabaseAdmin
}

export class ShortsService {
  // Shorts CRUD operations
  static async createShort(short: Omit<Short, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Short | null, error: any }> {
    try {
      const client = ensureAdmin()
      
      const { data, error } = await client
        .from('shorts')
        .insert(short)
        .select()
        .single()

      if (error) {
        logger.error('SHORTS_SERVICE', 'Error creating short', { error, short })
        return { data: null, error }
      }

      logger.info('SHORTS_SERVICE', 'Short created successfully', { shortId: data.id })
      return { data, error: null }
    } catch (error) {
      logger.error('SHORTS_SERVICE', 'Service error creating short', { error })
      return { data: null, error }
    }
  }

  static async getShorts(status?: 'draft' | 'pending_review' | 'published'): Promise<{ data: Short[] | null, error: any }> {
    try {
      const client = ensureAdmin()
      
      let query = client
        .from('shorts')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        logger.error('SHORTS_SERVICE', 'Error fetching shorts', { error, status })
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      logger.error('SHORTS_SERVICE', 'Service error fetching shorts', { error })
      return { data: null, error }
    }
  }

  static async updateShortStatus(id: string, status: 'draft' | 'pending_review' | 'published', publishedAt?: string): Promise<{ data: Short | null, error: any }> {
    try {
      const client = ensureAdmin()
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (publishedAt) {
        updateData.published_at = publishedAt
      }

      const { data, error } = await client
        .from('shorts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('SHORTS_SERVICE', 'Error updating short status', { error, id, status })
        return { data: null, error }
      }

      logger.info('SHORTS_SERVICE', 'Short status updated successfully', { shortId: id, status })
      return { data, error: null }
    } catch (error) {
      logger.error('SHORTS_SERVICE', 'Service error updating short status', { error })
      return { data: null, error }
    }
  }

  static async getTodaysShort(): Promise<{ data: Short | null, error: any }> {
    try {
      const client = ensureAdmin()
      
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await client
        .from('shorts')
        .select('*')
        .gte('created_at', today + 'T00:00:00.000Z')
        .lt('created_at', today + 'T23:59:59.999Z')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        logger.error('SHORTS_SERVICE', 'Error fetching today\'s short', { error })
        return { data: null, error }
      }

      return { data: data || null, error: null }
    } catch (error) {
      logger.error('SHORTS_SERVICE', 'Service error fetching today\'s short', { error })
      return { data: null, error }
    }
  }

  static async getLatestDailyReports(limit: number = 3): Promise<{ data: any[] | null, error: any }> {
    try {
      const client = ensureAdmin()
      
      const { data, error } = await client
        .from('daily_reports')
        .select('id, title, content, date, created_at')
        .order('date', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('SHORTS_SERVICE', 'Error fetching daily reports', { error, limit })
        return { data: null, error }
      }

      logger.info('SHORTS_SERVICE', 'Daily reports fetched successfully', { count: data?.length || 0 })
      return { data, error: null }
    } catch (error) {
      logger.error('SHORTS_SERVICE', 'Service error fetching daily reports', { error })
      return { data: null, error }
    }
  }

  // Generation logging
  static async logGeneration(log: Omit<GenerationLog, 'id' | 'created_at'>): Promise<{ data: GenerationLog | null, error: any }> {
    try {
      const client = ensureAdmin()
      
      const { data, error } = await client
        .from('generation_logs')
        .insert(log)
        .select()
        .single()

      if (error) {
        logger.error('SHORTS_SERVICE', 'Error logging generation', { error, log })
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      logger.error('SHORTS_SERVICE', 'Service error logging generation', { error })
      return { data: null, error }
    }
  }

  static async getGenerationLogs(shortId?: string): Promise<{ data: GenerationLog[] | null, error: any }> {
    try {
      const client = ensureAdmin()
      
      let query = client
        .from('generation_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (shortId) {
        query = query.eq('short_id', shortId)
      }

      const { data, error } = await query.limit(100)

      if (error) {
        logger.error('SHORTS_SERVICE', 'Error fetching generation logs', { error, shortId })
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      logger.error('SHORTS_SERVICE', 'Service error fetching generation logs', { error })
      return { data: null, error }
    }
  }
}