import Link from 'next/link'
import { Metadata } from 'next'
import PricingSection from '@/components/pricing/PricingSection'

export const metadata: Metadata = {
  title: 'サービス・料金 - Dupe＆more（デュープアンドモア）',
  description: '障害児専門脱毛サロンの脱毛メニュー、料金表、施術方法、サービス利用の流れをご紹介します。',
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">サービス</span>紹介
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            お子さま一人ひとりに合わせた、やさしい脱毛メニューと
            安心できる施術環境をご提供しています。
          </p>
        </div>
      </section>


      {/* Pricing Section */}
      <PricingSection />

      {/* Method Section */}
      <section className="section-padding bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              施術方法
            </h2>
            <p className="text-xl text-gray-600">
              お子さまにやさしい最新の脱毛技術
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl">💡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      光脱毛（IPL方式）
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      肌にやさしく、痛みが少ない光脱毛を採用。
                      お子さまの敏感な肌にも安心してご利用いただけます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl">❄️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      冷却システム
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      施術中の肌を冷却することで、不快感を最小限に抑えます。
                      温度調整も細かく行い、お子さまに合わせて調整します。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      専門スタッフによる施術
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      障害を持つお子さまへの理解と経験を持つ専門スタッフが、
                      お子さまの状態を見ながら丁寧に施術を行います。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center shadow-xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-4xl">🔬</span>
                  </div>
                  <p className="text-gray-600 font-medium">
                    最新の脱毛機器
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              サービス利用の流れ
            </h2>
            <p className="text-xl text-gray-600">
              お子さまのペースに合わせて、段階的に進めます
            </p>
          </div>

          <div className="relative">
            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="text-white text-3xl font-bold">1</span>
                  </div>
                  <div className="card p-6">
                    <div className="mb-4">
                      <span className="text-3xl">📋</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      カウンセリング
                    </h3>
                    <ul className="text-gray-600 text-left space-y-2">
                      <li>• お子さまの状況詳細ヒアリング</li>
                      <li>• 脱毛に関する不安や疑問の解消</li>
                      <li>• 最適なプランのご提案</li>
                      <li>• サロン見学・環境確認</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="text-white text-3xl font-bold">2</span>
                  </div>
                  <div className="card p-6">
                    <div className="mb-4">
                      <span className="text-3xl">🏠</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      環境に慣れる
                    </h3>
                    <ul className="text-gray-600 text-left space-y-2">
                      <li>• サロンの雰囲気に慣れる時間</li>
                      <li>• スタッフとの信頼関係構築</li>
                      <li>• 施術台での体験（光照射なし）</li>
                      <li>• お子さまのペースで進行</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="text-white text-3xl font-bold">3</span>
                  </div>
                  <div className="card p-6">
                    <div className="mb-4">
                      <span className="text-3xl">✨</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      施術開始
                    </h3>
                    <ul className="text-gray-600 text-left space-y-2">
                      <li>• お試し施術から開始</li>
                      <li>• 体調・機嫌に合わせた調整</li>
                      <li>• 段階的な施術範囲の拡大</li>
                      <li>• アフターケアまで丁寧に対応</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Lines (Desktop only) */}
            <div className="hidden md:block absolute top-10 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-primary-300 via-secondary-300 to-accent-300"></div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="section-padding bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              安全への取り組み
            </h2>
            <p className="text-xl text-gray-600">
              お子さまの安全を第一に考えた環境づくり
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🧼</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                徹底した衛生管理
              </h3>
              <p className="text-gray-600 text-sm">
                全ての機器の消毒・清拭を徹底し、清潔な環境を維持
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌡️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                肌状態の確認
              </h3>
              <p className="text-gray-600 text-sm">
                施術前後の肌チェックで安全性を確保
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                医療機関との連携
              </h3>
              <p className="text-gray-600 text-sm">
                万が一の際にはすぐに医療機関と連携できる体制
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                詳細な記録管理
              </h3>
              <p className="text-gray-600 text-sm">
                お子さまの状態や施術履歴を詳細に記録・管理
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            サービスについて詳しく知りたい方へ
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            お子さまに最適なプランをご提案いたします。
            まずは無料カウンセリングでお気軽にご相談ください。
          </p>
          <Link href="/contact" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block">
            無料相談予約はこちら
          </Link>
        </div>
      </section>
    </div>
  )
}