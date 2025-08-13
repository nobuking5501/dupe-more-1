import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface OwnerMessage {
  id: string
  year_month: string
  title: string
  body_md: string
  highlights: string[]
  sources: string[]
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  published_at?: string
}

export class SupabaseService {
  // Get published owner messages for public site
  static async getPublishedOwnerMessages(): Promise<{ data: OwnerMessage[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('owner_messages')
        .select('*')
        .eq('status', 'published')
        .order('year_month', { ascending: false })

      if (error) {
        console.error('Error fetching owner messages:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Service error:', error)
      return { data: null, error }
    }
  }

  // Get specific owner message by year-month
  static async getOwnerMessage(yearMonth: string): Promise<{ data: OwnerMessage | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('owner_messages')
        .select('*')
        .eq('year_month', yearMonth)
        .eq('status', 'published')
        .single()

      if (error) {
        console.error('Error fetching owner message:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Service error:', error)
      return { data: null, error }
    }
  }

  // Get blog posts (existing functionality)
  static async getBlogPosts(status: 'published' | 'draft' = 'published'): Promise<{ data: any[] | null, error: any }> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (status === 'published') {
        query = query.eq('published', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching blog posts:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Service error:', error)
      return { data: null, error }
    }
  }
}