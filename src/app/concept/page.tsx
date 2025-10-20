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
              <h2 className="text-3xl font-bold text-gray-800">kanaeからのメッセージ</h2>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <div className="bg-green-50 p-8 rounded-lg border-l-4 border-green-400">
                <p className="text-xl font-medium text-gray-700">
                  「諦めないでください。私も、13歳の知的障害・自閉症の息子を育てる母親です。<br />
                  だからこそ、<span className="text-red-600 font-bold">&ldquo;あなたの気持ち&rdquo;</span>が痛いほどわかります。」
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
              <h2 className="text-3xl font-bold text-gray-800">保護者が抱える不安</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg">
                <p className="text-gray-700 font-medium mb-2">「嫌がって施術が受けられないかもしれない」</p>
                <p className="text-gray-700 font-medium mb-2">「じっとしていられない」</p>
                <p className="text-gray-700 font-medium">「大きな声をだしてします」...等で</p>
              </div>
              <div className="text-center py-6">
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  「サロンで断られるかもしれない」とちゅうちょしていませんか？？
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
                  脱毛することで<br />
                  「生理がの時が楽」になったり「ひげ剃り時の痛みが軽減」したり<br />
                  「むだ毛処理による肌荒れ軽減」等のメリットがあります。
                </p>
                <div className="mt-6">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <p className="text-blue-700 font-semibold text-lg mb-2">当サロンでは</p>
                    <p className="text-gray-700 text-lg">
                      障害があっても、一般の方と同じように施術が受けられます。
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
              <h2 className="text-3xl font-bold text-gray-800">Kanaeからのお約束</h2>
            </div>
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-2xl font-bold text-gray-800">無理はしません。</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                  <p className="font-semibold text-gray-800">お客様のペースに合わせます。</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                  <p className="font-semibold text-gray-800">途中で嫌がってできなくなってしまっても、できた箇所のみの料金で安心です。</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                  <p className="font-semibold text-gray-800">立ったままでも、短時間でも大丈夫です。</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400">
                  <p className="font-semibold text-gray-800">来店したが施術に至らなかった場合：料金はいただきません。</p>
                </div>
                <div className="bg-pink-50 p-6 rounded-lg border-l-4 border-pink-400">
                  <p className="font-semibold text-gray-800">苦手なこと等、事前にしっかりカウンセリングでお聞きします。</p>
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
                  一人ひとりに合った方法を一緒にみつけていきたいと思っております。
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  同じ母親として、あなたのお子さまができた！と笑顔になる瞬間を一緒に増やしていきましょう！
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
              まずは、お気軽に公式LINEにてご相談ください。
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              「うちの子でも大丈夫？」そんな不安も含めて、お話をお聞かせください。
            </p>
            <div className="mb-8">
              <Link href="/contact" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block">
                公式LINEでの無料相談はこちら
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