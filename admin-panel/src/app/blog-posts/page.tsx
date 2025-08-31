'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  content: string
  newer_date: string
  older_date: string
  status: 'draft' | 'published'
  author_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  summary: string
  excerpt: string
  slug: string
  tags: string[]
}

export default function BlogPostsPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [bulkGenerating, setBulkGenerating] = useState(false)

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/blog-posts')
      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data)
      }
    } catch (error) {
      console.error('ブログ記事取得エラー:', error)
    }
  }

  const generateBlogPost = async (date?: string) => {
    setGenerating(true)
    try {
      const response = await fetch('/api/blog-posts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: date })
      })
      
      if (response.ok) {
        const newPost = await response.json()
        await fetchBlogPosts() // 再取得
        alert('ブログ記事が生成されました！')
      } else {
        const errorData = await response.json()
        alert(`ブログ記事の生成に失敗しました: ${errorData.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('生成エラー:', error)
      alert('生成エラーが発生しました。')
    }
    setGenerating(false)
  }

  const generateBulkBlogPosts = async () => {
    setBulkGenerating(true)
    try {
      const response = await fetch('/api/blog-posts/generate-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        await fetchBlogPosts() // 再取得
        alert(`一括生成完了！${result.generated_count}件のブログ記事が生成されました。`)
      } else {
        const errorData = await response.json()
        alert(`一括生成に失敗しました: ${errorData.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('一括生成エラー:', error)
      alert('一括生成エラーが発生しました。')
    }
    setBulkGenerating(false)
  }

  const publishPost = async (postId: string) => {
    setLoading(true)
    try {
      // 実際の実装では公開API呼び出し
      setBlogPosts(posts => 
        posts.map(post => 
          post.id === postId 
            ? { ...post, status: 'published' as const, published_at: new Date().toISOString() }
            : post
        )
      )
      alert('記事が公開されました！')
    } catch (error) {
      console.error('公開エラー:', error)
      alert('公開に失敗しました。')
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ブログ記事管理</h1>
            <p className="text-gray-600 mt-2">週次日報からブログ記事を生成・管理</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              ← 管理画面に戻る
            </Link>
            <button
              onClick={() => generateBlogPost()}
              disabled={generating || bulkGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? '生成中...' : '2日報→1記事'}
            </button>
            <button
              onClick={generateBulkBlogPosts}
              disabled={generating || bulkGenerating}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {bulkGenerating ? '一括生成中...' : '12日報→6記事'}
            </button>
          </div>
        </div>

        {/* ブログ記事一覧 */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">記事一覧</h2>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {blogPosts.map((post) => (
                  <div 
                    key={post.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedPost?.id === post.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {post.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? '公開済み' : '下書き'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      日報: {formatDate(post.newer_date)} & {formatDate(post.older_date)}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      タグ: {post.tags ? post.tags.join(', ') : 'なし'}
                    </p>
                  </div>
                ))}
                
                {blogPosts.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    まだブログ記事が生成されていません。
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 記事詳細・プレビュー */}
          <div className="lg:col-span-2">
            {selectedPost ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedPost.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          日報日付: {formatDate(selectedPost.newer_date)} & {formatDate(selectedPost.older_date)}
                        </span>
                        <span>
                          作成: {formatDate(selectedPost.created_at)}
                        </span>
                        {selectedPost.published_at && (
                          <span>
                            公開: {formatDate(selectedPost.published_at)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        要約: {selectedPost.summary}
                      </div>
                    </div>
                    
                    {selectedPost.status === 'draft' && (
                      <button
                        onClick={() => publishPost(selectedPost.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? '公開中...' : '公開する'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {selectedPost.content}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        文字数: {selectedPost.content.length} 文字
                      </span>
                      <span>
                        スラッグ: {selectedPost.slug}
                      </span>
                      <span>
                        タグ: {selectedPost.tags.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center text-gray-500">
                  <div className="mb-4">
                    📝
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    記事を選択してください
                  </h3>
                  <p className="text-sm">
                    左側の記事一覧から記事を選択すると、こちらにプレビューが表示されます。
                  </p>
                  
                  <div className="mt-8 space-y-4">
                    <p className="text-sm text-gray-600">
                      週次ブログ記事生成について：
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg text-left">
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• 2つの日報データから自動生成</li>
                        <li>• 対応する小話も組み込んだ感動的な記事</li>
                        <li>• Claude AIが1500-2200文字程度の記事を作成</li>
                        <li>• コンセプト「諦めないで」に沿った内容</li>
                        <li>• 自動的に公開状態で作成</li>
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