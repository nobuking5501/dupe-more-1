import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'コンセプト - Dupe＆more（デュープアンドモア）',
  description: '諦めないで。一緒に、できる方法を見つけましょう。同じ想いを持つ母として、あなたのお子さまが笑顔になれるよう支援いたします。',
}

export default function ConceptPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            「諦めないで。一緒に、<br className="md:hidden" />
            <span className="text-blue-600 font-bold">できる方法を見つけましょう。</span>」
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mt-8">
            あなたのお子さまも、きっと喜んでくれます
          </h2>
        </div>
      </section>

      {/* 🌱 共感の入り口 */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <span className="text-4xl mr-4">🌱</span>
              <h2 className="text-3xl font-bold text-gray-800">共感の入り口</h2>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <div className="bg-green-50 p-8 rounded-lg border-l-4 border-green-400">
                <p className="text-xl font-medium text-gray-700">
                  「諦めないでください。私も、13歳の知的障害・自閉症の息子を育てる母親です。<br />
                  だからこそ、<span className="text-red-600 font-bold">&ldquo;あの気持ち&rdquo;</span>が痛いほどわかります。」
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💔 保護者が抱える不安の代弁 */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <span className="text-4xl mr-4">💔</span>
              <h2 className="text-3xl font-bold text-gray-800">保護者が抱える不安の代弁</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg">
                <p className="text-gray-700 font-medium mb-2">「一般のサロンでは断られるかもしれない」</p>
                <p className="text-gray-700 font-medium mb-2">「暴れてしまったらどうしよう」</p>
                <p className="text-gray-700 font-medium">「周りの目が怖い」</p>
              </div>
              <div className="text-center py-6">
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  そう思って、最初から諦めていませんか？
                </p>
                <p className="text-lg text-gray-600">
                  私も同じように感じていました。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌸 希望の提示 */}
      <section className="section-padding bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <span className="text-4xl mr-4">🌸</span>
              <h2 className="text-3xl font-bold text-gray-800">希望の提示</h2>
            </div>
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 mb-4">でも――</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  障害があっても、お子さまの<span className="text-pink-600 font-bold">「きれいになりたい」</span><span className="text-blue-600 font-bold">「ラクになりたい」</span>という気持ちは、他の子と同じです。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-pink-50 p-6 rounded-lg">
                    <p className="text-pink-700 font-semibold text-lg mb-2">👧 女の子なら</p>
                    <p className="text-gray-700">
                      毛がなくなることで「女の子らしくなれた」と喜びます。
                    </p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-blue-700 font-semibold text-lg mb-2">👦 男の子なら</p>
                    <p className="text-gray-700">
                      毎朝の自己処理から解放されて「気持ちがラクになった」と笑顔になります。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🤝 お約束と伴走 */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <span className="text-4xl mr-4">🤝</span>
              <h2 className="text-3xl font-bold text-gray-800">お約束と伴走</h2>
            </div>
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-2xl font-bold text-gray-800">無理はしません。</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                  <p className="font-semibold text-gray-800">お子さまのペースに合わせます。</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                  <p className="font-semibold text-gray-800">嫌がることは絶対にしません。</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                  <p className="font-semibold text-gray-800">立ったままでも、短時間でも大丈夫です。</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400">
                  <p className="font-semibold text-gray-800">光や音が苦手なら、事前にしっかり配慮します。</p>
                </div>
              </div>
              <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg text-center border-2 border-green-200">
                <p className="text-lg text-gray-700 mb-4">
                  「多動だから絶対に無理」と思っていた保護者さまからも、
                </p>
                <p className="text-xl font-bold text-green-600">
                  「できないと思っていたことができた！」
                </p>
                <p className="text-lg text-gray-700 mt-2">
                  という喜びの声をいただいています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌈 最後のメッセージ */}
      <section className="section-padding bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8 justify-center">
              <span className="text-4xl mr-4">🌈</span>
              <h2 className="text-3xl font-bold text-gray-800">最後のメッセージ</h2>
            </div>
            <div className="space-y-8 text-center">
              <div className="bg-white p-8 rounded-lg shadow-xl border-2 border-red-200">
                <p className="text-xl font-bold text-red-600 mb-6">
                  「障害があるから無理」――そう思ってほしくありません。
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  必ず、一人ひとりに合った方法があります。
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  同じ母親として、あなたのお子さまが<span className="text-blue-600 font-bold text-xl">&ldquo;できた！&rdquo;と笑顔になる瞬間</span>を一緒に作っていきたい。
                </p>
                <p className="text-xl font-bold text-gray-800">
                  そのお手伝いを、心からさせてください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-custom text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-6">
              まずは、お気軽にご相談ください。
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              「うちの子でも大丈夫？」そんな不安も含めて、お話をお聞かせください。
            </p>
            <div className="mb-8">
              <Link href="/contact" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block">
                無料相談予約はこちら
              </Link>
            </div>
            <p className="text-lg text-gray-600 italic">
              一緒に子どもを育てている母親だからこそ、あなたの気持ちがわかります。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}