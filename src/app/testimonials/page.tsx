import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お客様の声・実績 - Dupe＆more（デュープアンドモア）',
  description: '障害児専門脱毛サロンをご利用いただいたお客様の実際の声と実績をご紹介します。',
}

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "田中様（お子様：8歳・自閉症スペクトラム）",
      age: "8歳",
      condition: "自閉症スペクトラム",
      period: "通院期間：8ヶ月",
      rating: 5,
      content: "最初は新しい環境に慣れるか心配でしたが、スタッフの皆さんが息子のペースに合わせて丁寧に対応してくださいました。感覚過敏があるので音や光に敏感なのですが、事前に相談したところ、照明を調整してくださったり、好きな音楽をかけてくださったりと配慮が素晴らしかったです。今では施術を楽しみにするようになりました。",
      result: "顔周りの産毛が薄くなり、毎日のケアが格段に楽になりました。",
      avatar: "👦"
    },
    {
      id: 2,
      name: "佐藤様（お子様：12歳・ダウン症）",
      age: "12歳",
      condition: "ダウン症",
      period: "通院期間：1年2ヶ月",
      rating: 5,
      content: "思春期に入り、体毛が気になり始めた娘のためにこちらのサロンを選びました。娘は人見知りが激しいのですが、スタッフの方が根気強く信頼関係を築いてくださいました。施術中も娘の様子をよく見てくださり、疲れたら休憩を入れるなど柔軟に対応していただけて本当に助かりました。",
      result: "腕と足の脱毛が完了し、プールの授業も自信を持って参加できるようになりました。",
      avatar: "👧"
    },
    {
      id: 3,
      name: "山田様（お子様：10歳・ADHD）",
      age: "10歳",
      condition: "ADHD",
      period: "通院期間：6ヶ月",
      rating: 5,
      content: "息子はじっとしているのが苦手で、最初は施術が続けられるか不安でした。でも、スタッフの方が息子の好きなアニメの話をしながら施術してくださったり、短時間で区切って進めてくださったりと、息子に合わせた方法を考えてくださいました。家族の不安にも寄り添ってくださり、心強かったです。",
      result: "ワキと顔の脱毛で毛量が減り、衛生面でのメリットを実感しています。",
      avatar: "👦"
    },
    {
      id: 4,
      name: "鈴木様（お子様：9歳・脳性麻痺）",
      age: "9歳",
      condition: "脳性麻痺",
      period: "通院期間：10ヶ月",
      rating: 5,
      content: "車椅子を使用している娘の施術をお願いしました。バリアフリーの設備が整っているだけでなく、娘が車椅子から施術台に移る際も丁寧にサポートしてくださいます。施術中も娘の体調や姿勢に気を配ってくださり、安心してお任せできます。何より、娘が「きれいになった」と喜んでいる姿を見ると、こちらを選んで本当に良かったと思います。",
      result: "足の脱毛により、日常のケアが楽になり、皮膚トラブルも減りました。",
      avatar: "👧"
    },
    {
      id: 5,
      name: "高橋様（お子様：11歳・知的障害）",
      age: "11歳",
      condition: "知的障害",
      period: "通院期間：7ヶ月",
      rating: 5,
      content: "息子は言葉でのコミュニケーションが難しく、初回のカウンセリングで不安を感じていました。しかし、スタッフの方が息子の表情や仕草をよく観察してくださり、息子なりのサインを理解してくださるようになりました。毎回同じスタッフの方が担当してくださるので、息子も安心して通えています。",
      result: "全身脱毛で体毛が薄くなり、入浴時の介助が楽になりました。",
      avatar: "👦"
    },
    {
      id: 6,
      name: "伊藤様（お子様：13歳・てんかん）",
      age: "13歳",
      condition: "てんかん",
      period: "通院期間：4ヶ月",
      rating: 5,
      content: "発作の心配があるため、施術を受けられるサロンがなかなか見つからず困っていました。こちらのサロンでは、かかりつけ医と連携を取りながら安全に施術を進めてくださいます。発作が起きた時の対応もしっかりと準備されており、親としても安心してお任せできます。娘も施術を通じて自信がついたようです。",
      result: "顔と腕の脱毛が順調に進み、学校生活での自信につながっています。",
      avatar: "👧"
    }
  ]

  const achievements = [
    {
      icon: "👥",
      number: "150+",
      label: "累計利用者数",
      description: "2022年開業以来"
    },
    {
      icon: "😊",
      number: "98%",
      label: "お客様満足度",
      description: "アンケート結果より"
    },
    {
      icon: "🏆",
      number: "95%",
      label: "継続率",
      description: "最後まで通院完了"
    },
    {
      icon: "⭐",
      number: "4.9",
      label: "平均評価",
      description: "5段階評価"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">お客様の声</span>・実績
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            実際にご利用いただいたお客様からの声と、
            これまでの実績をご紹介いたします。
          </p>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              実績
            </h2>
            <p className="text-xl text-gray-600">
              多くのお客様にご満足いただいています
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{achievement.icon}</span>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                  {achievement.number}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-1">
                  {achievement.label}
                </div>
                <div className="text-sm text-gray-500">
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              お客様の声
            </h2>
            <p className="text-xl text-gray-600">
              実際にご利用いただいた保護者の方々からのお声
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-lg">⭐</span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {testimonial.name}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>お子様：{testimonial.age}・{testimonial.condition}</p>
                      <p>{testimonial.period}</p>
                    </div>
                  </div>
                </div>

                <blockquote className="text-gray-600 leading-relaxed mb-6 border-l-4 border-primary-200 pl-4">
                  "{testimonial.content}"
                </blockquote>

                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    施術結果
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              症状別対応事例
            </h2>
            <p className="text-xl text-gray-600">
              様々な障害を持つお子さまへの対応実績
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🧩</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                自閉症スペクトラム
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• 感覚過敏への配慮（照明・音・温度調整）</li>
                <li>• 予定の見える化とスケジュール共有</li>
                <li>• 馴染みのスタッフによる継続対応</li>
                <li>• 好きなものを取り入れたリラックス環境</li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💙</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                ダウン症
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• ゆっくりとした説明と理解の確認</li>
                <li>• 体調面への細やかな配慮</li>
                <li>• 保護者同席での安心感確保</li>
                <li>• 個人のペースに合わせた進行</li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                ADHD
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• 短時間での施術区切り</li>
                <li>• 集中力を保つための工夫</li>
                <li>• 動きへの理解と柔軟な対応</li>
                <li>• 興味のある話題での関係構築</li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                知的障害
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• 分かりやすい説明と視覚的サポート</li>
                <li>• 非言語コミュニケーションの活用</li>
                <li>• 段階的な慣れへのアプローチ</li>
                <li>• 達成感を大切にした進行</li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">♿</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                身体障害
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• バリアフリー環境での施術</li>
                <li>• 移乗時の安全なサポート</li>
                <li>• 体位や姿勢への配慮</li>
                <li>• 介助者との連携</li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                てんかん
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• 医療機関との事前連携</li>
                <li>• 発作時の対応体制完備</li>
                <li>• 薬物管理への理解</li>
                <li>• 安全性を最優先した施術</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="section-padding bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              施術による変化
            </h2>
            <p className="text-xl text-gray-600">
              多くのご家族が実感されている変化
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                施術前によくあるお悩み
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 text-xl mt-1">😰</span>
                  <p className="text-gray-600">毎日の体毛処理が大変で時間がかかる</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 text-xl mt-1">😔</span>
                  <p className="text-gray-600">プールや体育の授業を嫌がるようになった</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 text-xl mt-1">😓</span>
                  <p className="text-gray-600">皮膚トラブルが起きやすい</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 text-xl mt-1">😞</span>
                  <p className="text-gray-600">外見を気にして消極的になってしまった</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 text-xl mt-1">😟</span>
                  <p className="text-gray-600">一般的なサロンでは施術を断られる</p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                施術後の変化
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">😊</span>
                  <p className="text-gray-600">日常のケアが格段に楽になった</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">🏊</span>
                  <p className="text-gray-600">プールや運動を積極的に楽しむようになった</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">✨</span>
                  <p className="text-gray-600">肌の状態が良くなり清潔感がアップ</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">😄</span>
                  <p className="text-gray-600">自信を持って様々な活動に参加できる</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl mt-1">👪</span>
                  <p className="text-gray-600">家族全体のストレスが軽減された</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            同じような変化を実感してみませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            多くのお客様が実感されている変化を、
            あなたのお子さまにも体験していただけます。
          </p>
          <Link href="/contact" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block">
            無料相談予約はこちら
          </Link>
        </div>
      </section>
    </div>
  )
}