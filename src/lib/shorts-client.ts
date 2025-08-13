import { supabase } from './supabase-client'

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

export class ShortsClient {
  // Get published shorts for public display
  static async getPublishedShorts(limit?: number): Promise<{ data: Short[] | null, error: any }> {
    try {
      let query = supabase
        .from('shorts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching published shorts:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Service error fetching published shorts:', error)
      return { data: null, error }
    }
  }

  // Get latest published short (for homepage)
  static async getLatestShort(): Promise<{ data: Short | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('shorts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching latest short:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Service error fetching latest short:', error)
      return { data: null, error }
    }
  }

  // Search shorts by text or tags
  static async searchShorts(query: string): Promise<{ data: Short[] | null, error: any }> {
    try {
      const searchTerm = `%${query}%`
      
      const { data, error } = await supabase
        .from('shorts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.${searchTerm},body_md.ilike.${searchTerm}`)
        .order('published_at', { ascending: false })

      if (error) {
        console.error('Error searching shorts:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Service error searching shorts:', error)
      return { data: null, error }
    }
  }

  // Get shorts by tag
  static async getShortsByTag(tag: string): Promise<{ data: Short[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('shorts')
        .select('*')
        .eq('status', 'published')
        .contains('tags', [tag])
        .order('published_at', { ascending: false })

      if (error) {
        console.error('Error fetching shorts by tag:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Service error fetching shorts by tag:', error)
      return { data: null, error }
    }
  }

  // Get paginated shorts
  static async getPaginatedShorts(page: number = 1, pageSize: number = 10): Promise<{ 
    data: Short[] | null, 
    error: any,
    totalCount: number,
    totalPages: number,
    currentPage: number
  }> {
    try {
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      // Get total count
      const { count } = await supabase
        .from('shorts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      // Get paginated data
      const { data, error } = await supabase
        .from('shorts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(start, end)

      if (error) {
        console.error('Error fetching paginated shorts:', error)
        return { 
          data: null, 
          error,
          totalCount: 0,
          totalPages: 0,
          currentPage: page
        }
      }

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / pageSize)

      return { 
        data, 
        error: null,
        totalCount,
        totalPages,
        currentPage: page
      }
    } catch (error) {
      console.error('Service error fetching paginated shorts:', error)
      return { 
        data: null, 
        error,
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      }
    }
  }

  // Get all unique tags from published shorts
  static async getTags(): Promise<{ data: string[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('shorts')
        .select('tags')
        .eq('status', 'published')

      if (error) {
        console.error('Error fetching tags:', error)
        return { data: null, error }
      }

      // Extract unique tags
      const allTags = data?.flatMap(item => item.tags || []) || []
      const uniqueTags = Array.from(new Set(allTags)).sort()

      return { data: uniqueTags, error: null }
    } catch (error) {
      console.error('Service error fetching tags:', error)
      return { data: null, error }
    }
  }
}