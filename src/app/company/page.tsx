import { Metadata } from 'next'
import Link from 'next/link'
import MonthlyMessage from '@/components/MonthlyMessage'

export const metadata: Metadata = {
  title: '会社概要 | Dupe&more',
  description: '障害者専門脱毛サロンDupe&moreの会社概要・理念・沿革をご紹介します。',
}

export default function CompanyPage() {
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
            <span className="text-gray-900">会社概要</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900">
            会社概要
          </h1>
          <p className="text-gray-600 mt-2">
            私たちの理念と取り組みをご紹介します
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {/* 理念・ミッション */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">私たちの理念</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">ミッション</h3>
            <p className="text-gray-700 leading-relaxed">
              すべての人が安心してリラックスできる美容空間を提供し、お客様一人ひとりの感覚特性に寄り添った丁寧なケアを通じて、
              自信と笑顔をお届けします。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-blue-600 text-4xl mb-3">🤝</div>
              <h4 className="font-semibold text-gray-900 mb-2">寄り添う心</h4>
              <p className="text-sm text-gray-600">お客様のペースに合わせた個別対応</p>
            </div>
            <div className="text-center p-4">
              <div className="text-blue-600 text-4xl mb-3">🛡️</div>
              <h4 className="font-semibold text-gray-900 mb-2">安心・安全</h4>
              <p className="text-sm text-gray-600">感覚特性に配慮した環境づくり</p>
            </div>
            <div className="text-center p-4">
              <div className="text-blue-600 text-4xl mb-3">✨</div>
              <h4 className="font-semibold text-gray-900 mb-2">成長支援</h4>
              <p className="text-sm text-gray-600">自信を育む丁寧なサポート</p>
            </div>
          </div>
        </section>

        {/* 会社情報 */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">会社情報</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <table className="w-full">
                <tbody className="space-y-4">
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-700 w-32">会社名</td>
                    <td className="py-3 text-gray-900">Dupe&more</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-700">事業内容</td>
                    <td className="py-3 text-gray-900">障害者専門脱毛サロン運営</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-700">設立</td>
                    <td className="py-3 text-gray-900">2024年</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-700">代表者</td>
                    <td className="py-3 text-gray-900">代表 渡邊</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">私たちの特徴</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>感覚過敏に配慮した施術環境</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>個別支援計画に基づくケア</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>専門知識を持つスタッフによる対応</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>リラックスできる空間設計</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 沿革 */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">沿革</h2>
          
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
            
            <div className="space-y-8">
              <div className="relative flex items-start">
                <div className="absolute left-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                <div className="ml-12">
                  <h3 className="text-lg font-semibold text-gray-900">2024年</h3>
                  <p className="text-gray-600">障害者専門脱毛サロンDupe&more設立</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="absolute left-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                <div className="ml-12">
                  <h3 className="text-lg font-semibold text-gray-900">2024年8月</h3>
                  <p className="text-gray-600">Webサイト開設、オンライン予約システム導入</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 保護者様へのメッセージ */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">保護者様へのメッセージ</h2>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="text-green-600 text-3xl">💌</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  今月のスタッフからのメッセージ
                </h3>
                <div className="text-gray-700 leading-relaxed mb-4">
                  <MonthlyMessage />
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">更新日:</span> {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <p>
              このメッセージは、スタッフの日々の活動や思いから、毎月自動的に生成・更新されています。
              お子様への想いや成長への願いを込めてお届けしております。
            </p>
          </div>
        </section>

        {/* アクセス・お問い合わせ */}
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">アクセス・お問い合わせ</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">お気軽にお問い合わせください</h3>
              <p className="text-gray-600 mb-4">
                初回のご相談やご不明な点がございましたら、お電話またはWebフォームからお問い合わせください。
                お客様のペースに合わせて丁寧にご説明いたします。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  お問い合わせ
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  サービス詳細
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">営業時間</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-700">平日</td>
                    <td className="py-2 text-gray-900">10:00 - 19:00</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-700">土日祝</td>
                    <td className="py-2 text-gray-900">10:00 - 18:00</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-gray-700">定休日</td>
                    <td className="py-2 text-gray-900">不定休</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}