import Link from 'next/link'
import { ShortsClient, Short } from '@/lib/shorts-client'

// Convert markdown to HTML (simple implementation)
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/## (.+)/g, '<h2 class="text-xl font-semibold text-gray-900 mb-3 mt-6">$1</h2>')
    .replace(/### (.+)/g, '<h3 class="text-lg font-semibold text-gray-800 mb-2 mt-4">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    .replace(/\n/g, '<br>')
}

// Truncate text to specified character limit
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

async function getShortsData(): Promise<{
  latest: Short | null
  recent: Short[]
}> {
  try {
    const { data: shorts } = await ShortsClient.getPublishedShorts(4)
    
    if (!shorts || shorts.length === 0) {
      return { latest: null, recent: [] }
    }

    return {
      latest: shorts[0] || null,
      recent: shorts.slice(1, 4) || []
    }
  } catch (error) {
    console.error('Error fetching shorts data:', error)
    return { latest: null, recent: [] }
  }
}

export default async function ShortsToday() {
  const { latest, recent } = await getShortsData()

  // Placeholder content when no shorts are available
  if (!latest) {
    return (
      <section id="shorts-today" className="section-padding bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              今日の小話
            </h2>
            <p className="text-xl text-gray-600">
              運営からの心温まるメッセージ
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-3xl mx-auto">
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
      </section>
    )
  }

  return (
    <section id="shorts-today" className="section-padding bg-gradient-to-r from-blue-50 via-white to-purple-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            今日の小話
          </h2>
          <p className="text-xl text-gray-600">
            サロンでの心温まる出来事から生まれた、やさしいメッセージ
          </p>
        </div>

        {/* Latest Short - Featured */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-12 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {latest.title}
            </h3>
            <time className="text-sm text-gray-500">
              {latest.published_at && new Date(latest.published_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>

          <div className="prose max-w-none text-center mb-6">
            <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
              {latest.body_md}
            </div>
          </div>

          {latest.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {latest.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/shorts"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              すべての小話を読む
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Shorts - Snippets */}
        {recent.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              過去の小話
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recent.map((short) => (
                <div
                  key={short.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {short.title}
                    </h4>
                    <time className="text-xs text-gray-500">
                      {short.published_at && new Date(short.published_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </div>

                  <div className="text-gray-600 text-sm leading-relaxed mb-4">
                    {truncateText(short.body_md.replace(/[#*\\n]/g, ' '), 90)}
                  </div>

                  {short.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {short.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/shorts"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                もっと見る
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}