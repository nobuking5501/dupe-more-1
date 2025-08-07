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

      {/* Mother's Perspective Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              同じ想いを持つ母として
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                私も13歳の息子を育てる母親です。知的障害・自閉症の息子を持つ私だからこそ、あなたの気持ちが痛いほどわかります。
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 font-medium mb-2">「一般のサロンでは無理だろう」</p>
                <p className="text-gray-700 font-medium mb-2">「周りの目が気になる」</p>
                <p className="text-gray-700 font-medium mb-2">「暴れてしまったらどうしよう」</p>
                <p className="text-gray-700 font-medium">「断られるのではないか」</p>
              </div>
              <p className="text-center font-semibold text-xl text-red-600">
                そんな不安で、最初から諦めていませんか？
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Normal Kids Section */}
      <section className="section-padding bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              「普通の女の子と同じように」「普通の男の子と同じように」
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p className="font-semibold text-xl text-pink-700">
                年頃の女の子なら、誰でも脇や腕の毛を気にするもの。
              </p>
              <p className="font-semibold text-xl text-blue-700">
                男の子だって、ヒゲ剃りで血だらけになるのは可哀想。
              </p>
              <p className="text-xl font-medium text-gray-700 mt-8">
                障害があっても、お子さまの「きれいになりたい」「楽になりたい」という気持ちは同じです。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              無理はしません。お子さまのペースで。
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-800 mb-2">嫌がることは絶対にしません</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-800 mb-2">じっと寝ていられなくても大丈夫</p>
                <p className="text-gray-600 text-sm">（立ったままでも施術します）</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-800 mb-2">音や光が苦手なら事前に配慮します</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-800 mb-2">親御さんと相談しながら進めます</p>
              </div>
            </div>
            <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg text-center">
              <p className="text-lg text-gray-700">
                「多動だから絶対に無理」と思っていた保護者さまからも、<br />
                <span className="font-semibold text-green-600">「できないと思っていたことができた！」</span>と喜びの声をいただいています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              毎日が少し、楽になります
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mb-6">
                  <span className="text-white text-2xl">👦</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  男の子のお客さま：
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  「毎朝のヒゲ剃りが面倒で嫌がっていたのに、すごく楽になって本人も喜んでいます」
                </p>
              </div>
              <div className="card p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center mb-6">
                  <span className="text-white text-2xl">👧</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  女の子のお客さま：
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  「なくなって嬉しい！女の子らしくなった！」と、お子さま自身が実感されています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promise Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              私からのお約束
            </h2>
            <div className="space-y-8">
              <p className="text-2xl font-bold text-red-700">
                障害者だからといって、諦めないでください。
              </p>
              <div className="text-lg text-gray-600 leading-relaxed space-y-4">
                <p>
                  一人ひとりのお子さまに合わせた方法が必ずあります。
                </p>
                <p>
                  同じ立場の母親として、あなたのお子さまが笑顔になれるよう、一緒に最適な方法を見つけていきましょう。
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