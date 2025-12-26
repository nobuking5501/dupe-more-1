'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MonthlyMessage {
  id: string
  year_month: string
  message: string
  generated_at: string
  source_reports_count: number
  is_archived: boolean
}

export default function MonthlyMessagesPage() {
  const [messages, setMessages] = useState<MonthlyMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<MonthlyMessage | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      // 仮のデータ（実際にはFirebaseから取得予定）
      const mockMessages = [
        {
          id: '1',
          year_month: '2024-08',
          message: '今月も多くのお客様との素晴らしい出会いがありました。スタッフ一同、お一人お一人の特性を理解し、安心して過ごせる環境作りに努めています。',
          generated_at: '2024-08-31T09:00:00Z',
          source_reports_count: 20,
          is_archived: false
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('メッセージ取得エラー:', error)
    }
  }

  const generateMessage = async () => {
    setLoading(true)
    try {
      // 仮の実装
      alert('月次メッセージが生成されました！')
    } catch (error) {
      console.error('生成エラー:', error)
      alert('生成エラーが発生しました。')
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatYearMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-')
    return `${year}年${month}月`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">月次メッセージ管理</h1>
            <p className="text-gray-600 mt-2">日報データから生成される月次メッセージの管理</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              ← 管理画面に戻る
            </Link>
            <button
              onClick={generateMessage}
              disabled={loading}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? '生成中...' : '今月のメッセージを生成'}
            </button>
          </div>
        </div>

        {/* メッセージ一覧 */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">メッセージ一覧</h2>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-yellow-50 border-r-4 border-yellow-500' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {formatYearMonth(message.year_month)}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        message.is_archived 
                          ? 'bg-gray-100 text-gray-600' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {message.is_archived ? 'アーカイブ済み' : 'アクティブ'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {message.message}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      日報 {message.source_reports_count} 件から生成
                    </p>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    まだ月次メッセージが生成されていません。
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* メッセージ詳細 */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {formatYearMonth(selectedMessage.year_month)} のメッセージ
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          生成日: {formatDate(selectedMessage.generated_at)}
                        </span>
                        <span>
                          使用日報: {selectedMessage.source_reports_count} 件
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="prose max-w-none">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        文字数: {selectedMessage.message.length} 文字
                      </span>
                      <span>
                        ステータス: {selectedMessage.is_archived ? 'アーカイブ済み' : 'アクティブ'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">使用方法</h4>
                    <p className="text-sm text-yellow-700">
                      このメッセージは会社概要ページに自動表示されます。
                      メインサイトで確認してください。
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center text-gray-500">
                  <div className="mb-4">
                    💌
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    メッセージを選択してください
                  </h3>
                  <p className="text-sm">
                    左側のメッセージ一覧から確認したいメッセージを選択してください。
                  </p>
                  
                  <div className="mt-8 space-y-4">
                    <p className="text-sm text-gray-600">
                      月次メッセージについて：
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg text-left">
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• 毎月の日報データからClaude AIが自動生成</li>
                        <li>• 保護者向けの温かいメッセージ</li>
                        <li>• メインサイトの会社概要ページに表示</li>
                        <li>• 200-300文字程度の適切な長さ</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}