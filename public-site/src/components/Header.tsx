'use client'

import Link from 'next/link'
import { useState } from 'react'
import ActionButton from './ActionButton'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'ホーム', href: '/' },
    { name: 'コンセプト', href: '/concept' },
    { name: 'サービス', href: '/services' },
    { name: 'お客様の声', href: '/testimonials' },
    { name: 'メッセージ', href: '/owner-message' },
    { name: '小話', href: '/shorts' },
    { name: 'FAQ', href: '/faq' },
    { name: 'ブログ', href: '/blog' },
    { name: 'お問合せ', href: '/contact' }
  ]

  return (
    <header className="bg-secondary-200/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/images/aicon01.png" 
                alt="Dupe&more ロゴ" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Dupe＆more</h1>
              <p className="text-xs text-text-secondary">デュープアンドモア</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-text-secondary hover:text-accent-400 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
            <ActionButton 
              href="/contact" 
              ariaLabel="無料相談を予約する"
            >
              無料相談予約
            </ActionButton>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`block w-6 h-0.5 bg-text-secondary transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-text-secondary transition-all duration-300 mt-1 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-text-secondary transition-all duration-300 mt-1 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-primary-200">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-text-secondary hover:text-accent-400 transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-4" onClick={() => setIsMenuOpen(false)}>
                <ActionButton 
                  href="/contact" 
                  ariaLabel="無料相談を予約する"
                  className="w-full text-center"
                >
                  無料相談予約
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header