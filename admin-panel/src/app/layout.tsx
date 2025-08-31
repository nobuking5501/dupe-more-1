import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dupe&more 管理画面',
  description: '障害者専門脱毛サロンDupe&moreの管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}