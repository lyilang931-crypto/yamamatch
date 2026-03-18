import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YamaMatch - AI登山ルート提案',
  description: '体力・経験レベルを入力するだけで、AIが関西の山を最適提案。あなたにぴったりの山との出会いを。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased" style={{ background: 'var(--background)' }}>
        <header className="sticky top-0 z-50 border-b border-green-900/10 bg-[#F5F0E8]/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">⛰️</span>
              <span className="text-lg font-bold tracking-tight text-green-900">
                YamaMatch
              </span>
            </a>
            <nav className="flex items-center gap-4 text-sm font-medium text-green-800">
              <a href="/mountains" className="hover:text-green-600 transition-colors hidden sm:block">
                山一覧
              </a>
              <a
                href="/profile"
                className="rounded-full bg-green-800 px-4 py-1.5 text-white hover:bg-green-700 transition-colors"
              >
                プロフィール
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 pb-16 pt-6">{children}</main>
      </body>
    </html>
  )
}
