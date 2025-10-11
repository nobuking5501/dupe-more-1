import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Dupe＆more（デュープアンドモア）- 障害者専門脱毛サロン',
  description: '障害をお持ちのお子さまとご家族が、安心して通えるやさしい脱毛サロンです。専門スタッフによる丁寧なカウンセリングと安心できる環境をご提供します。',
  keywords: '障害児,脱毛,専門サロン,安心,優しい,カウンセリング',
  openGraph: {
    title: 'Dupe＆more（デュープアンドモア）- 障害者専門脱毛サロン',
    description: '障害をお持ちのお子さまとご家族が、安心して通えるやさしい脱毛サロンです。',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}