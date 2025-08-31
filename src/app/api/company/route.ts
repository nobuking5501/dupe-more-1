import { NextResponse } from 'next/server'

// 会社概要の静的データ
const companyData = {
  name: 'Dupe&more',
  description: '障害者専門脱毛サロン',
  established: '2024年',
  representative: '代表 田中',
  mission: 'すべての人が安心してリラックスできる美容空間を提供し、お客様一人ひとりの感覚特性に寄り添った丁寧なケアを通じて、自信と笑顔をお届けします。',
  features: [
    '感覚過敏に配慮した施術環境',
    '個別支援計画に基づくケア',
    '専門知識を持つスタッフによる対応',
    'リラックスできる空間設計'
  ],
  businessHours: {
    weekday: '10:00 - 19:00',
    weekend: '10:00 - 18:00',
    holiday: '不定休'
  },
  history: [
    {
      year: '2024年',
      description: '障害者専門脱毛サロンDupe&more設立'
    },
    {
      year: '2024年8月',
      description: 'Webサイト開設、オンライン予約システム導入'
    }
  ]
}

export async function GET() {
  try {
    return NextResponse.json({
      data: companyData
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}