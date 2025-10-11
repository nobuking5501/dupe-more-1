import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { adminDb } from '@/lib/firebaseAdmin'

async function getBlogPosts() {
  try {
    // statusフィルターのみ使用（インデックス不要）
    const blogsSnapshot = await adminDb
      .collection('blog_posts')
      .where('status', '==', 'published')
      .get()

    // JavaScriptでソート
    const blogs = blogsSnapshot.docs.map(doc => {
      const data = doc.data()
      // excerptがない場合はcontentから生成
      let excerpt = data.excerpt || data.summary || ''
      if (!excerpt && data.content) {
        excerpt = data.content.substring(0, 150) + '...'
      }

      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        slug: data.slug,
        excerpt: excerpt,
        tags: data.tags || [],
        status: data.status,
        created_at: data.createdAt?.toDate().toISOString(),
        published_at: data.publishedAt?.toDate().toISOString(),
        staff: { name: 'かなえ' },
        _createdAt: data.createdAt?.toDate().getTime() || 0
      }
    })

    // 作成日時でソート（新しい順）
    return blogs.sort((a, b) => b._createdAt - a._createdAt)
  } catch (error) {
    console.error('ブログ取得エラー:', error)
    return []
  }
}

export default async function BlogPage() {
  // 公開されているブログ記事を取得
  const blogPosts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ブログ
          </h1>
          <p className="text-lg text-gray-600">
            スタッフの日々の想いや、サロンでの出来事をお伝えします
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {blogPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-6">📝</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              記事はまだありません
            </h2>
            <p className="text-gray-600 mb-8">
              スタッフが心を込めて記事を準備中です。<br />
              もうしばらくお待ちください。
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              ホームに戻る
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post: any) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {post.image_url && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <time dateTime={post.published_at || post.created_at}>
                      {formatDate(post.published_at || post.created_at)}
                    </time>
                    {post.staff?.name && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{post.staff.name}</span>
                      </>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    続きを読む
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}