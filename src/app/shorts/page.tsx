import { Metadata } from 'next'
import Link from 'next/link'
import { adminDb } from '@/lib/firebaseAdmin'
import ShortsListing, { Short } from './ShortsListing'

export const metadata: Metadata = {
  title: '今日の小話 | Dupe&more',
  description: 'サロンでの心温まる出来事や気づきを綴った小話をお届けします。',
  openGraph: {
    title: '今日の小話 | Dupe&more',
    description: 'サロンでの心温まる出来事や気づきを綴った小話をお届けします。',
    type: 'website',
  },
}

// Force dynamic rendering to get latest data
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getInitialData() {
  try {
    // Directly use Firebase to get latest short stories
    console.log('Fetching shorts directly from Firebase for /shorts page')
    // statusフィルターのみ使用（インデックス不要）
    const storiesSnapshot = await adminDb
      .collection('short_stories')
      .where('status', '==', 'active')
      .get()

    if (!storiesSnapshot.empty) {
      const stories = storiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        _createdAt: doc.data().createdAt?.toDate().getTime() || 0,
        _isFeatured: doc.data().isFeatured ? 1 : 0
      }))

      // JavaScriptでソート（isFeatured優先、次にcreatedAt降順）
      stories.sort((a: any, b: any) => {
        if (b._isFeatured !== a._isFeatured) {
          return b._isFeatured - a._isFeatured
        }
        return b._createdAt - a._createdAt
      })

      // 上位12件のみ取得
      const limitedStories = stories.slice(0, 12)

      console.log('Firebase shorts fetched for /shorts page:', limitedStories.length, 'items')

      // Convert to Short format (same as admin-shorts API)
      const formattedShorts = limitedStories.map((story: any) => ({
        id: story.id,
        title: story.title,
        body_md: story.content,
        tags: [story.emotionalTone],
        status: 'published' as const,
        pii_risk_score: 0,
        source_report_ids: [story.sourceReportId],
        created_at: story.createdAt?.toDate().toISOString(),
        published_at: story.createdAt?.toDate().toISOString(),
        updated_at: story.updatedAt?.toDate().toISOString() || story.createdAt?.toDate().toISOString()
      }))

      // Extract unique tags
      const allTags = formattedShorts.flatMap((item: Short) => item.tags || [])
      const uniqueTags = Array.from(new Set(allTags)).sort()

      return {
        shorts: formattedShorts,
        totalCount: formattedShorts.length,
        totalPages: Math.ceil(formattedShorts.length / 12),
        tags: uniqueTags,
        error: null
      }
    }

    // No data available
    console.log('No short stories data available')
    return {
      shorts: [],
      totalCount: 0,
      totalPages: 0,
      tags: [],
      error: null
    }
  } catch (error) {
    console.error('Error fetching initial data for /shorts:', error)
    return {
      shorts: [],
      totalCount: 0,
      totalPages: 0,
      tags: [],
      error: error
    }
  }
}

export default async function ShortsPage() {
  const { shorts, totalCount, totalPages, tags, error } = await getInitialData()

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '今日の小話',
    description: 'サロンでの心温まる出来事や気づきを綴った小話',
    url: 'https://dupe-and-more.com/shorts',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalCount,
      itemListElement: shorts.map((short, index) => ({
        '@type': 'Article',
        position: index + 1,
        headline: short.title,
        datePublished: short.published_at,
        author: {
          '@type': 'Organization',
          name: 'Dupe&more'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Dupe&more'
        }
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container-custom py-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link href="/" className="hover:text-gray-900">
                ホーム
              </Link>
              <span>›</span>
              <span className="text-gray-900">今日の小話</span>
            </nav>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  今日の小話
                </h1>
                <p className="text-gray-600 mt-2 max-w-2xl">
                  サロンでの心温まる出来事や気づきを綴った小話をお届けします。
                  お客さまとスタッフの温かい交流から生まれる、小さな幸せの瞬間をご紹介します。
                </p>
              </div>

              <div className="mt-4 lg:mt-0 flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  全 {totalCount} 件
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom py-8">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-400 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">
                エラーが発生しました
              </h2>
              <p className="text-red-700">
                小話を読み込めませんでした。しばらくしてから再度お試しください。
              </p>
            </div>
          ) : shorts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                小話を準備中です
              </h2>
              <p className="text-gray-600">
                運営からの最新の&quot;やさしい小話&quot;を準備中です。<br />
                近日中に心温まるストーリーをお届けしますので、お楽しみにお待ちください。
              </p>
              <div className="mt-6">
                <Link
                  href="/services"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  サービス一覧を見る
                </Link>
              </div>
            </div>
          ) : (
            <ShortsListing 
              initialShorts={shorts}
              initialTotalPages={totalPages}
              initialTotalCount={totalCount}
              availableTags={tags}
            />
          )}

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              お気軽にお問い合わせください
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              小話でご紹介したような、一人ひとりに寄り添ったサービスを心がけています。
              初回のご来店でも安心してお過ごしいただけます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
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
      </div>
    </>
  )
}