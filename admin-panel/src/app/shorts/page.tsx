'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Short {
  id: string
  title: string
  body_md: string
  tags: string[]
  status: 'draft' | 'pending_review' | 'published'
  pii_risk_score: number
  source_report_ids: string[]
  created_at: string
  published_at?: string
  updated_at: string
}

export default function ShortsManagementPage() {
  const [shorts, setShorts] = useState<Short[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending_review' | 'published'>('all')
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  const fetchShorts = async (status?: string) => {
    try {
      const url = status && status !== 'all' ? `/api/shorts?status=${status}` : '/api/shorts'
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setShorts(result.data || [])
      } else {
        console.error('Failed to fetch shorts:', result.error)
      }
    } catch (error) {
      console.error('Error fetching shorts:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateShortStatus = async (id: string, newStatus: 'published' | 'draft') => {
    try {
      const response = await fetch(`/api/shorts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchShorts(filter === 'all' ? undefined : filter)
        alert(result.message)
      } else {
        alert(`Failed to update: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating short:', error)
      alert('Failed to update short')
    }
  }

  const generateNewShort = async () => {
    if (generating) return
    
    setGenerating(true)
    try {
      const response = await fetch('/api/shorts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(result.message)
        fetchShorts(filter === 'all' ? undefined : filter)
      } else {
        alert(`Generation failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error generating short:', error)
      alert('Failed to generate short')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchShorts(filter === 'all' ? undefined : filter)
  }, [filter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskScoreColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-50'
    if (score <= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50'
      case 'pending_review': return 'text-orange-600 bg-orange-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">小話データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">今日の小話 管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              日報から自動生成された小話の管理と公開承認
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
            <button
              onClick={() => router.push('/shorts/logs')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              生成ログを見る
            </button>
            <button
              onClick={generateNewShort}
              disabled={generating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? '生成中...' : '新しい小話を生成'}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-6">
          <div className="sm:hidden">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="pending_review">レビュー待ち</option>
              <option value="published">公開済み</option>
              <option value="draft">下書き</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              {[
                { key: 'all', label: 'すべて' },
                { key: 'pending_review', label: 'レビュー待ち' },
                { key: 'published', label: '公開済み' },
                { key: 'draft', label: '下書き' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === item.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Shorts List */}
        <div className="mt-6">
          {shorts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">小話がありません</h3>
              <p className="text-gray-500">「新しい小話を生成」ボタンから小話を作成してください。</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {shorts.map((short) => (
                  <li key={short.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{short.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(short.status)}`}>
                            {short.status === 'published' && '公開済み'}
                            {short.status === 'pending_review' && 'レビュー待ち'}
                            {short.status === 'draft' && '下書き'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskScoreColor(short.pii_risk_score)}`}>
                            リスク: {short.pii_risk_score}
                          </span>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-3">{short.body_md}</p>
                        </div>

                        {short.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {short.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-500">
                          作成: {formatDate(short.created_at)}
                          {short.published_at && (
                            <span className="ml-4">公開: {formatDate(short.published_at)}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {short.status === 'pending_review' && (
                          <button
                            onClick={() => updateShortStatus(short.id, 'published')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            公開する
                          </button>
                        )}
                        {short.status === 'published' && (
                          <button
                            onClick={() => updateShortStatus(short.id, 'draft')}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            公開停止
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}