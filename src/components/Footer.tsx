import Link from 'next/link'
import ActionButton from './ActionButton'

const Footer = () => {
  const quickLinks = [
    { name: 'ホーム', href: '/' },
    { name: 'コンセプト', href: '/concept' },
    { name: 'サービス', href: '/services' },
    { name: 'お客様の声', href: '/testimonials' },
    { name: '会社概要', href: '/company' }
  ]

  const supportLinks = [
    { name: 'FAQ', href: '/faq' },
    { name: '小話', href: '/shorts' },
    { name: 'ブログ', href: '/blog' },
    { name: 'お問合せ', href: '/contact' },
    { name: 'プライバシーポリシー', href: '/privacy' }
  ]

  return (
    <footer className="bg-gradient-to-r from-secondary-200 to-tertiary-200 border-t border-primary-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/images/aicon01.png" 
                  alt="Dupe&more ロゴ" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Dupe＆more</h3>
                <p className="text-sm text-text-secondary">デュープアンドモア</p>
              </div>
            </Link>
            <p className="text-text-secondary mb-4 leading-relaxed">
              障害を持つお子さまとご家族が安心して通える、やさしい脱毛サロンです。
              専門スタッフによる丁寧なカウンセリングと安心できる環境をご提供します。
            </p>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>📍 住所：〒605-0075 京都市東山区京阪祗園四条南座前カモガワビル2F</p>
              <p>📞 電話：070-4145-8613</p>
              <p>⏰ 営業時間：10:00-21:00（定休日：月曜日）</p>
              <p>📧 メール：dupe.more531@gmail.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">メニュー</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">サポート</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-primary-500 to-cream-200 rounded-2xl text-center shadow-lg">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            お気軽にお問い合わせください
          </h3>
          <p className="text-gray-700 mb-4">
            無料カウンセリングで、お子さまに合った最適なプランをご提案いたします
          </p>
          <ActionButton 
            href="/contact" 
            ariaLabel="無料相談を予約する"
          >
            無料相談予約
          </ActionButton>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-primary-200 text-center">
          <p className="text-text-secondary text-sm">
            © 2024 Dupe＆more（デュープアンドモア）. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer