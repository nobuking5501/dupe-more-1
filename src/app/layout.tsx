import type { Metadata } from 'next'
import Script from 'next/script'
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
        {/* Facebook Pixel Code */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1849477399322279');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1849477399322279&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Facebook Pixel Code */}

        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}