import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'アクセス | Dupe&more',
  description: '障害者専門脱毛サロンDupe&moreへのアクセス方法・営業時間・駐車場情報をご案内します。',
}

export default function AccessPage() {
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
            <span className="text-gray-900">アクセス</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900">
            アクセス
          </h1>
          <p className="text-gray-600 mt-2">
            京阪祇園四条駅すぐ、安心してお越しいただけます
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {/* 基本情報 */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">店舗情報</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 text-xl">📍</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">住所</h3>
                    <p className="text-gray-700">
                      〒605-0075<br />
                      京都市東山区大和大路西入ル<br />
                      中之町200カモガワビル2F
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 text-xl">📞</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">電話番号</h3>
                    <p className="text-gray-700">
                      <a href="tel:070-4145-8613" className="hover:text-blue-600 transition-colors">
                        070-4145-8613
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 text-xl">📧</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">メール</h3>
                    <p className="text-gray-700">
                      <a href="mailto:dupe.more531@gmail.com" className="hover:text-blue-600 transition-colors">
                        dupe.more531@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">営業時間</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="w-full text-sm">
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium text-gray-700">平日</td>
                      <td className="py-2 text-gray-900">10:00 - 21:00</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium text-gray-700">土日祝</td>
                      <td className="py-2 text-gray-900">10:00 - 18:00</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-700">定休日</td>
                      <td className="py-2 text-gray-900">月曜日</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">※注意：</span> 
                  完全予約制です。事前にお電話またはWebフォームからご予約をお取りください。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* アクセス方法 */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">アクセス方法</h2>
          
          <div className="space-y-6">
            {/* 電車でのアクセス */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🚃 電車でお越しの場合</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>京阪本線「祇園四条駅」</strong>より徒歩1分</p>
                <p><strong>阪急京都線「河原町駅」</strong>より徒歩5分</p>
                <p><strong>地下鉄東西線「三条京阪駅」</strong>より徒歩8分</p>
              </div>
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">おすすめ：</span>
                  京阪祇園四条駅が最寄りです。4番出口から南座方面へ向かうとすぐです。
                </p>
              </div>
            </div>

            {/* 車でのアクセス */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🚗 お車でお越しの場合</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>京都東ICから</strong>約15分</p>
                <p><strong>四条通り経由</strong>が分かりやすいルートです</p>
              </div>
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <span className="font-medium">駐車場について：</span>
                  専用駐車場はございません。近隣のコインパーキングをご利用ください。
                  事前にお問い合わせいただければ、おすすめの駐車場をご案内いたします。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 周辺情報 */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">周辺情報</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">🏛️</div>
              <h3 className="font-semibold text-gray-900 mb-2">南座</h3>
              <p className="text-sm text-gray-600">徒歩1分</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">🌸</div>
              <h3 className="font-semibold text-gray-900 mb-2">祇園・花見小路</h3>
              <p className="text-sm text-gray-600">徒歩3分</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">🏪</div>
              <h3 className="font-semibold text-gray-900 mb-2">コンビニ・薬局</h3>
              <p className="text-sm text-gray-600">徒歩2分圏内</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🅿️ おすすめ駐車場</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 祇園四条駐車場（徒歩2分）</li>
              <li>• コインパーク祇園（徒歩3分）</li>
              <li>• 河原町駐車場（徒歩5分）</li>
            </ul>
          </div>
        </section>

        {/* お問い合わせ */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ご不明な点はお気軽にお問い合わせください
            </h2>
            <p className="text-gray-700 mb-6">
              初回のご相談は無料です。道に迷った場合もお電話でご案内いたします。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                お問い合わせフォーム
              </Link>
              <a
                href="tel:070-4145-8613"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-300 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
              >
                📞 電話で問い合わせ
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}