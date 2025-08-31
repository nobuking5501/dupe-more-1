import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
export interface DailyReport {
  id: string
  staff_id?: string
  staff_name: string
  report_date: string
  weather_temperature?: string // 天気・気温（季節感の演出用）
  customer_attributes?: string // お客様の属性（年代・性別・来店回数）
  visit_reason_purpose?: string // お客様の来店のきっかけ・目的
  treatment_details?: string // 本日の施術内容（部位・時間・機器）
  customer_before_treatment?: string // 施術前のお客様の様子（表情・不安や期待）
  customer_after_treatment?: string // 施術後のお客様の反応（感想・笑顔・変化）
  salon_atmosphere?: string // 今日のサロンの雰囲気や出来事（BGM・香り・小話）
  insights_innovations?: string // 今日の気づき・工夫（喜ばれた点や障害者向け配慮）
  kanae_personal_thoughts?: string // かなえさんのひと言感想（嬉しかったこと・明日への思い）
  created_at: string
  updated_at: string
}

export interface MonthlyMessage {
  id: string
  year_month: string
  message: string
  generated_at: string
  source_reports_count: number
  is_archived: boolean
}

export interface BlogPost {
  id: string
  title: string
  content: string
  week_start_date: string
  week_end_date: string
  source_reports_count: number
  status: 'draft' | 'published'
  author_name: string
  published_at: string | null
  created_at: string
  updated_at: string
}