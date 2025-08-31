'use client'
import Link from 'next/link'

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dupe&more 管理画面
          </h1>
          <p className="text-gray-600 mb-6">
            障害者専門脱毛サロンの管理システムです
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Link href="/admin/pipeline" className="bg-red-50 p-6 rounded-lg hover:bg-red-100 transition-colors block">
              <h2 className="text-xl font-semibold text-red-900 mb-2">🔄 パイプライン</h2>
              <p className="text-red-700 text-sm">
                自動化システムの状態確認・管理
              </p>
            </Link>

            <Link href="/daily-reports" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors block">
              <h2 className="text-xl font-semibold text-green-900 mb-2">日報管理</h2>
              <p className="text-green-700 text-sm">
                スタッフの日報入力・一覧表示
              </p>
            </Link>

            <Link href="/short-stories" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors block">
              <h2 className="text-xl font-semibold text-purple-900 mb-2">小話管理</h2>
              <p className="text-purple-700 text-sm">
                日報から小話生成・管理・公開
              </p>
            </Link>
            
            <Link href="/blog-posts" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors block">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">ブログ記事管理</h2>
              <p className="text-blue-700 text-sm">
                日報ペアからブログ記事生成・管理
              </p>
            </Link>
            
            <Link href="/monthly-messages" className="bg-yellow-50 p-6 rounded-lg hover:bg-yellow-100 transition-colors block">
              <h2 className="text-xl font-semibold text-yellow-900 mb-2">月次メッセージ</h2>
              <p className="text-yellow-700 text-sm">
                月次メッセージの確認・管理
              </p>
            </Link>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">システム概要</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">日報システム</h4>
                <p className="text-sm text-gray-600">
                  かなえさんが日々のお客様との関わりや気づきを10項目で詳細に記録。
                  AIが様々なコンテンツに活用します。
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">小話生成</h4>
                <p className="text-sm text-gray-600">
                  日報投稿後に自動で心温まる小話を生成。
                  最新の小話がメインサイトトップに表示されます。
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">ブログ記事生成</h4>
                <p className="text-sm text-gray-600">
                  週単位（月曜日〜日曜日）の日報データから、
                  2000文字程度のブログ記事を自動生成します。
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              管理画面 - ポート: 3002
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}