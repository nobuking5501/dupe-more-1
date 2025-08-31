'use client'

import { useState, useEffect } from 'react'

interface MonthlyMessageData {
  id: string
  year_month: string
  message: string
  generated_at: string
  source_reports_count: number
}

export default function MonthlyMessage() {
  const [message, setMessage] = useState<MonthlyMessageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMonthlyMessage()
  }, [])

  const fetchMonthlyMessage = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/monthly-message')
      
      if (!response.ok) {
        throw new Error('メッセージの取得に失敗しました')
      }
      
      const data = await response.json()
      setMessage(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">メッセージを読み込み中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-yellow-600 text-xl mr-3">⚠️</div>
          <div>
            <p className="text-yellow-800 font-medium mb-2">
              メッセージの読み込みに問題が発生しました
            </p>
            <p className="text-yellow-700 text-sm mb-3">{error}</p>
            <p className="text-yellow-700 text-sm">
              代わりに、私たちの基本的なメッセージをお伝えします：
            </p>
            <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-400">
              <p className="text-gray-700">
                お子様一人ひとりの個性を大切にし、安心できる環境で丁寧なケアを提供しています。
                感覚特性に配慮した施術を心がけ、お子様のペースに合わせて進めてまいります。
                ご不明な点やご相談がございましたら、いつでもお気軽にお声かけください。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!message) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-3xl mb-3">📝</div>
        <p className="text-gray-600 mb-2">今月のメッセージを準備中です</p>
        <p className="text-gray-500 text-sm">
          スタッフの日報から心を込めたメッセージを作成しております。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
        {message.message}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
        <span>
          {message.source_reports_count}件の日報から生成
        </span>
        <span>
          生成日: {new Date(message.generated_at).toLocaleDateString('ja-JP')}
        </span>
      </div>
    </div>
  )
}