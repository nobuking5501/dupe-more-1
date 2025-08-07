import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくあるご質問 - Dupe＆more（デュープアンドモア）',
  description: '障害を持つお子さまの脱毛について、よくあるご質問にお答えします。同じ立場の母親として、どんな小さなことでもお聞かせください。',
}

export default function FAQPage() {
  const faqCategories = [
    {
      title: "サービス全般について",
      questions: [
        {
          q: "障害者向け脱毛サービスを始められたきっかけは？",
          a: "私自身が13歳の知的障害・自閉症の息子を持つ母親です。将来的に息子の脱毛をしてあげたいと思った時、一般の脱毛サロンでは対応が難しいと感じ、同じような悩みを持つ親御さんのお役に立ちたいと思い始めました。"
        },
        {
          q: "どのような障害のお子さまが対象ですか？",
          a: "知的障害、自閉症、多動など、様々な障害をお持ちのお子さまに対応しております。障害の種類や程度に関わらず、まずはお気軽にご相談ください。一人ひとりに合わせた方法を一緒に考えさせていただきます。"
        }
      ]
    },
    {
      title: "施術について",
      questions: [
        {
          q: "じっとしていられない子でも大丈夫ですか？",
          a: "はい、大丈夫です。ベッドに寝転ぶのを嫌がるお子さまには立ったまま施術を行います。多動で動き回ってしまうお子さまにも対応しており、「絶対に無理だと思っていた」という親御さんからも喜びの声をいただいております。"
        },
        {
          q: "嫌がった場合はどうなりますか？",
          a: "無理に抑えつけたり、嫌がることを強制することは一切ありません。お子さまの様子を見ながら、親御さんと相談して進めるかどうかを判断します。来ることを嫌がるようになってほしくないので、お子さまのペースを最優先にしています。"
        },
        {
          q: "音や光が苦手な子でも施術できますか？",
          a: "事前に音や光の苦手な程度をお聞きし、耳を覆っていただくなどの配慮をいたします。機械の音や光について詳しくご説明し、お子さまに合わせた対策を一緒に考えさせていただきます。"
        }
      ]
    },
    {
      title: "脱毛の効果・部位について",
      questions: [
        {
          q: "どの部位の脱毛ができますか？",
          a: "男の子: 主にヒゲ脱毛、その他ご相談に応じて\n女の子: 脇、腕、足など見える部分\n衛生面: VIO脱毛（排泄後の痒み軽減など）"
        },
        {
          q: "完全に毛がなくなりますか？",
          a: "一切生えてこなくなるということはありませんが、大幅に減少します。例えば、毎日のヒゲ剃りが不要になったり、自己処理が楽になったりと、日常生活が大きく改善されます。"
        },
        {
          q: "効果はどのくらいで実感できますか？",
          a: "個人差はありますが、通っていただいているお子さまからは「毎朝のヒゲ剃りが楽になった」「血だらけになることがなくなった」「女の子らしくなって嬉しい」などの声をいただいております。"
        }
      ]
    },
    {
      title: "安全性・心配事について",
      questions: [
        {
          q: "一般のサロンで断られた経験があります",
          a: "そのような経験をされた方も多くいらっしゃいます。当サービスは障害をお持ちのお子さま専門ですので、一般のサロンでは対応が困難な場合でも、お子さまに合わせた方法を見つけることができます。"
        },
        {
          q: "親の付き添いは必要ですか？",
          a: "はい、基本的には親御さんの付き添いをお願いしております。お子さまの特性や好みを一番よくご存じの親御さんと連携することで、より安心して施術を受けていただけます。"
        }
      ]
    },
    {
      title: "費用・予約について",
      questions: [
        {
          q: "料金はどうなっていますか？",
          a: "お子さまの状態や施術部位により異なりますので、まずはご相談ください。障害をお持ちのお子さま向けの料金設定でご案内いたします。"
        },
        {
          q: "初回相談は無料ですか？",
          a: "詳細については直接お問い合わせください。お子さまの状態や親御さんのご不安について、まずはお話をお聞かせいただければと思います。"
        }
      ]
    },
    {
      title: "その他のご質問",
      questions: [
        {
          q: "他に同じような悩みを持つ親御さんはいらっしゃいますか？",
          a: "はい、多くの親御さんが同じような悩みを抱えていらっしゃいます。「普通の年頃の子と同じようにしてあげたい」「日常のケアを楽にしてあげたい」という親心は皆さん同じです。一人で抱え込まず、お気軽にご相談ください。"
        },
        {
          q: "「障害者だから無理」と諦めていました",
          a: "障害者だからといって諦める必要はありません。「できないと思っていたことができた」という喜びの声を多数いただいております。まずは一度ご相談いただければ、一緒に方法を考えさせていただきます。"
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            よくあるご質問<span className="text-blue-600">（FAQ）</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            障害を持つお子さまの脱毛について、皆さまからよくいただくご質問にお答えします。<br />
            その他のご質問も、お気軽にお問い合わせください。
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl mx-auto">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 border-l-4 border-blue-500 pl-4">
                {category.title}
              </h2>
              <div className="space-y-6">
                {category.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-start">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mr-3 flex-shrink-0 mt-0.5">
                        Q{categoryIndex * 10 + faqIndex + 1}
                      </span>
                      {faq.q}
                    </h3>
                    <div className="ml-16">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block">
                        A
                      </span>
                      <div className="text-gray-600 leading-relaxed">
                        {faq.a.split('\n').map((line, lineIndex) => (
                          <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                            {line.startsWith('男の子:') || line.startsWith('女の子:') || line.startsWith('衛生面:') ? (
                              <><strong className="text-gray-700">{line.split(':')[0]}:</strong> {line.split(':')[1]}</>
                            ) : (
                              line
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <div className="card p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              その他のご質問やご不安がございましたら
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              同じ立場の母親として、どんな小さなことでもお聞かせいただければと思います。<br />
              お子さまのことを一番に考えて、一緒に最適な方法を見つけましょう。
            </p>
            <a 
              href="/contact" 
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
            >
              お気軽にお問い合わせください
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}