'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ShortStory {
  id: string
  title: string
  content: string
  sourceReportId: string
  reportDate: string
  weatherInfo: string
  customerType: string
  keyMoment: string
  emotionalTone: string
  status: 'active' | 'archived'
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export default function ShortStoriesPage() {
  const [stories, setStories] = useState<ShortStory[]>([])
  const [selectedStory, setSelectedStory] = useState<ShortStory | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/short-stories')
      if (response.ok) {
        const data = await response.json()
        setStories(data)
        // 最初の小話を自動選択
        if (data.length > 0 && !selectedStory) {
          setSelectedStory(data[0])
        }
      }
    } catch (error) {
      console.error('小話取得エラー:', error)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  const generateFromLatestReport = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/short-stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const newStory = await response.json()
        // 既存の小話を更新または新規追加
        setStories(prevStories => {
          const existingIndex = prevStories.findIndex(s => s.id === newStory.id)
          if (existingIndex >= 0) {
            // 既存の小話を更新
            const updated = [...prevStories]
            updated[existingIndex] = newStory
            return updated
          } else {
            // 新規の小話を先頭に追加
            return [newStory, ...prevStories]
          }
        })
        setSelectedStory(newStory)
        alert('最新の日報から小話が生成されました！')
      } else {
        alert('小話の生成に失敗しました。')
      }
    } catch (error) {
      console.error('生成エラー:', error)
      alert('生成エラーが発生しました。')
    }
    setGenerating(false)
  }

  const toggleFeatured = async (storyId: string, currentFeatured: boolean) => {
    setLoading(true)
    try {
      const response = await fetch('/api/short-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: storyId, is_featured: !currentFeatured })
      })
      if (!response.ok) throw new Error('更新失敗')
      setStories(stories =>
        stories.map(story => ({
          ...story,
          isFeatured: story.id === storyId ? !currentFeatured : false
        }))
      )
      if (selectedStory?.id === storyId) {
        setSelectedStory(prev => prev ? { ...prev, isFeatured: !currentFeatured } : null)
      }
      alert(currentFeatured ? 'トップページ掲載を解除しました' : 'トップページに掲載設定しました')
    } catch (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました。')
    }
    setLoading(false)
  }

  const archiveStory = async (storyId: string) => {
    if (!confirm('この小話をアーカイブしますか？')) return

    setLoading(true)
    try {
      const response = await fetch('/api/short-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: storyId, status: 'archived' })
      })
      if (!response.ok) throw new Error('アーカイブ失敗')
      setStories(stories =>
        stories.map(story =>
          story.id === storyId
            ? { ...story, status: 'archived' as const }
            : story
        )
      )
      if (selectedStory?.id === storyId) {
        setSelectedStory(null)
      }
      alert('小話をアーカイブしました')
    } catch (error) {
      console.error('アーカイブエラー:', error)
      alert('アーカイブに失敗しました。')
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const getEmotionIcon = (tone: string) => {
    switch (tone) {
      case 'heartwarming': return '💝'
      case 'inspiring': return '✨'
      case 'gentle': return '🌸'
      default: return '💫'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">小話管理</h1>
            <p className="text-gray-600 mt-2">日報から自動生成される心温まる小話の管理</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              ← 管理画面に戻る
            </Link>
            <button
              onClick={generateFromLatestReport}
              disabled={generating}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {generating ? '生成中...' : '最新日報から生成'}
            </button>
          </div>
        </div>

        {/* 小話一覧・詳細 */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">小話一覧</h2>
                <p className="text-sm text-gray-500 mt-1">{stories.length} 件の小話</p>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {stories.filter(story => story.status === 'active').map((story) => (
                  <div 
                    key={story.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedStory?.id === story.id ? 'bg-purple-50 border-r-4 border-purple-500' : ''
                    }`}
                    onClick={() => setSelectedStory(story)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {getEmotionIcon(story.emotionalTone)} {story.title}
                      </h3>
                      {story.isFeatured && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          掲載中
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">
                      {formatDate(story.reportDate)} • {story.weatherInfo}
                    </p>

                    <p className="text-xs text-gray-600 mb-2">
                      {story.customerType}
                    </p>

                    <p className="text-xs text-gray-400 line-clamp-2">
                      {story.keyMoment}
                    </p>
                  </div>
                ))}
                
                {stories.filter(story => story.status === 'active').length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    まだ小話が生成されていません。
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 小話詳細・プレビュー */}
          <div className="lg:col-span-2">
            {selectedStory ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                        {getEmotionIcon(selectedStory.emotionalTone)} {selectedStory.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {formatDate(selectedStory.reportDate)} • {selectedStory.weatherInfo}
                        </span>
                        <span>
                          {selectedStory.customerType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFeatured(selectedStory.id, selectedStory.isFeatured)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedStory.isFeatured
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {selectedStory.isFeatured ? 'トップ掲載中' : 'トップに掲載'}
                      </button>
                      
                      <button
                        onClick={() => archiveStory(selectedStory.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm font-medium disabled:opacity-50"
                      >
                        アーカイブ
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">印象的な瞬間</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedStory.keyMoment}
                    </p>
                  </div>
                  
                  <div className="prose max-w-none">
                    <h4 className="font-medium text-gray-900 mb-4">小話内容</h4>
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                      {selectedStory.content}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        文字数: {selectedStory.content.length} 文字
                      </span>
                      <span>
                        感情トーン: {selectedStory.emotionalTone}
                      </span>
                      <span>
                        作成: {formatDate(selectedStory.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center text-gray-500">
                  <div className="mb-4">
                    💫
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    小話を選択してください
                  </h3>
                  <p className="text-sm">
                    左側の小話一覧から詳細を確認したい小話を選択してください。
                  </p>
                  
                  <div className="mt-8 space-y-4">
                    <p className="text-sm text-gray-600">
                      小話について：
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg text-left">
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• 日報投稿後に自動生成される心温まる小話</li>
                        <li>• 最新の小話がメインサイトトップページに表示</li>
                        <li>• お客様のプライバシーに配慮した内容</li>
                        <li>• 300-500文字程度の読みやすい長さ</li>
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