import { Metadata } from 'next'
import Link from 'next/link'
import { SupabaseService, OwnerMessage } from '@/lib/supabase-client'

export const metadata: Metadata = {
  title: 'オーナーメッセージ | Dupe&more',
  description: 'サロンオーナーからのメッセージをお届けします。',
}

// Format year-month for display
function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  return `${year}年${parseInt(month)}月`
}

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

async function getOwnerMessages(): Promise<OwnerMessage[]> {
  const result = await SupabaseService.getPublishedOwnerMessages()
  return result.data || []
}

export default async function OwnerMessagePage() {
  const messages = await getOwnerMessages()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-gray-900">
              ホーム
            </Link>
            <span>›</span>
            <span className="text-gray-900">オーナーメッセージ</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900">
            オーナーメッセージ
          </h1>
          <p className="text-gray-600 mt-2">
            サロンオーナーからのメッセージをお届けします
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">📮</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              メッセージはまだありません
            </h2>
            <p className="text-gray-600">
              新しいメッセージが公開されるとこちらに表示されます。
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((message) => (
              <article
                key={message.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Message Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {message.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-medium">
                          {formatYearMonth(message.year_month)}
                        </span>
                        {message.published_at && (
                          <span>
                            公開日: {new Date(message.published_at).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                {message.highlights && message.highlights.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      今月のハイライト
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {message.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div className="px-6 py-6">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: `<p class="text-gray-700 leading-relaxed mb-4">${markdownToHtml(message.body_md)}</p>`
                    }}
                  />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Dupe&more オーナー
                    </span>
                    <div className="flex items-center space-x-4">
                      <Link
                        href="/contact"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        お問い合わせ
                      </Link>
                      <Link
                        href="/services"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        サービス詳細
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            初めての方へ
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            お一人お一人に寄り添ったサービスを心がけています。
            初回のご来店でもリラックしてお過ごしいただけるよう、丁寧にご対応いたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              サービス一覧
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
  )
}