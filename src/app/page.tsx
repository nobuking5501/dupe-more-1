import Link from 'next/link'
import ShortsToday from '@/components/ShortsToday'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/002.jpg)',
            backgroundPosition: 'center 47%',
          }}
        >
          {/* White Overlay */}
          <div className="absolute inset-0 bg-white/50"></div>
        </div>
        
        {/* Content */}
        <div className="container-custom relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6" style={{lineHeight: '1.4', textShadow: '2px 2px 4px rgba(0,0,0,0.1)'}}>
              <span className="block mb-4">障害をお持ちのお子さまとご家族が、</span>
              <span className="block mb-4">安心して通える</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.2)'}}>
                やさしい脱毛サロン
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-4xl mx-auto" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.1)'}}>
              Dupe&more（デュープアンドモア）では、障害をお持ちのお子さまとご家族が
              安心して施術を受けられる、完全個室の特別な環境をご用意しています。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary text-lg px-8 py-4 shadow-xl">
                無料相談予約
              </Link>
              <Link href="/concept" className="bg-white/90 backdrop-blur-sm border-2 border-white/50 text-gray-800 hover:bg-white font-medium py-3 px-8 rounded-full transition-all duration-300 text-lg">
                コンセプトを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Shorts Section */}
      <ShortsToday />

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              安心して通える3つの理由
            </h2>
            <p className="text-xl text-gray-600">
              障害をお持ちの方とご家族の気持ちに寄り添います
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">💙</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                専門スタッフによる丁寧なケア
              </h3>
              <p className="text-gray-600 leading-relaxed">
                障害をお持ちの方の特性を理解した専門スタッフが、
                一人ひとりに合わせた施術を行います。
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                安心できる環境づくり
              </h3>
              <p className="text-gray-600 leading-relaxed">
                完全個室の落ち着いた空間で、お客様が安心して
                施術を受けられる環境を整えています。
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">👪</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                ご家族のサポート
              </h3>
              <p className="text-gray-600 leading-relaxed">
                ご家族の不安や心配にもしっかりと寄り添い、
                安心して通い続けられるようサポートします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              ご利用の流れ
            </h2>
            <p className="text-xl text-gray-600">
              お子さまのペースに合わせて、段階的に進めます
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                公式LINEにて無料相談
              </h3>
              <p className="text-gray-600 leading-relaxed">
                施術を受けるお客様の状況やご希望を詳しくお聞きし、
                最適なプランをご提案いたします。
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                事前カウンセリングシート記入<br />
                ご予約決定
              </h3>
              <p className="text-gray-600 leading-relaxed">
                まずはサロンの雰囲気に慣れていただき、
                スタッフとの信頼関係を築きます。
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                ご来店
              </h3>
              <p className="text-gray-600 leading-relaxed">
                施術を受けるお客様の体調やご機嫌に合わせて、
                無理のないペースで施術を行います。
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/services" className="btn-primary">
              サービス詳細を見る
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            まずは無料相談から始めませんか？
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            障害をお持ちの方の状況や脱毛に関するご不安、どんなことでもお気軽にご相談ください。
            専門スタッフが丁寧にお答えいたします。
          </p>
          <Link href="/contact" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block">
            公式LINEでの無料相談
          </Link>
        </div>
      </section>
    </>
  )
}