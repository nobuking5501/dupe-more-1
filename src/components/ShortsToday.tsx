import Link from 'next/link'

interface Short {
  id: string
  title: string
  body_md: string
  tags: string[]
  status: string
  pii_risk_score: number
  source_report_ids: string[]
  created_at: string
  published_at?: string
  updated_at: string
}

async function getShortsData(): Promise<{
  latest: Short | null
}> {
  try {
    // Use featured short stories API (already using Firebase)
    console.log('Fetching latest short from /api/short-stories/featured')

    // Vercel本番環境では絶対URLが必要
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const featuredResponse = await fetch(`${baseUrl}/api/short-stories/featured`, {
      next: { revalidate: 0 },
      cache: 'no-store'
    })

    if (featuredResponse.ok) {
      const featured = await featuredResponse.json()
      console.log('Featured short fetched:', featured)

      if (featured && featured.title) {
        // Convert from featured API format to Short format
        return {
          latest: {
            id: featured.id,
            title: featured.title,
            body_md: featured.content,
            tags: [featured.emotionalTone],
            status: 'published',
            pii_risk_score: 0,
            source_report_ids: [featured.sourceReportId],
            created_at: featured.createdAt,
            published_at: featured.createdAt,
            updated_at: featured.updatedAt || featured.createdAt
          }
        }
      }
    }

    console.log('No featured short available')
    return { latest: null }
  } catch (error) {
    console.error('Error fetching latest short:', error)
    return { latest: null }
  }
}

export default async function ShortsToday() {
  const { latest } = await getShortsData()

  // Add emotion icon helper
  const getEmotionIcon = (tags: string[]) => {
    if (tags.includes('heartwarming') || tags.includes('温かい')) return '💝'
    if (tags.includes('inspiring') || tags.includes('希望')) return '✨'
    if (tags.includes('gentle') || tags.includes('やさしい')) return '🌸'
    return '💫'
  }

  // Placeholder content when no shorts are available
  if (!latest) {
    return (
      <section id="shorts-today" className="section-padding bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              💫 今日の小話
            </h2>
            <p className="text-xl text-gray-600">
              サロンでの心温まる出来事をお届けします
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🌸</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              やさしい小話を準備中です
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              運営からの最新の&quot;やさしい小話&quot;を準備中です。<br />
              サロンでの心温まる出来事や気づきを、近日中にお届けしますので<br />
              お楽しみにお待ちください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                サービス詳細
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="shorts-today" className="section-padding bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            💫 今日の小話
          </h2>
          <p className="text-xl text-gray-600">
            サロンでの心温まる出来事をお届けします
          </p>
        </div>

        {/* Latest Short - Featured with modern design */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto mb-12">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center">
                  {getEmotionIcon(latest.tags)} {latest.title}
                </h3>
                <time className="text-purple-100 text-sm">
                  {latest.published_at && new Date(latest.published_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                  本日の小話
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                {latest.body_md}
              </div>
            </div>
          </div>

          {/* Tags */}
          {latest.tags.length > 0 && (
            <div className="px-8 pb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {latest.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer with enhanced call-to-action */}
          <div className="bg-gray-50 px-8 py-6 border-t">
            <div className="text-center">
              <div className="mb-4">
                <span className="text-sm text-gray-500">Dupe&more サロンより</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  他にも心温まるエピソードがたくさんあります
                </p>
                
                <Link
                  href="/shorts"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  すべての小話を読む
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <p className="text-xs text-gray-400">
                  サロンでの日々の出来事を通じて、お客様との温かい交流をご紹介しています
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}