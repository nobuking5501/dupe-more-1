import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SupabaseService } from '../../../lib/supabase-client'
import { formatDate } from '../../../lib/utils'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

async function getBlogPost(id: string) {
  const { data, error } = await SupabaseService.supabase
    .from('blog_posts')
    .select(`
      *,
      staff:author_id (
        name,
        email
      )
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="bg-white">
        {/* ヘッダー */}
        <div className="container-custom py-8">
          <nav className="flex items-center text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-gray-700">
              ブログ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium truncate">
              {post.title}
            </span>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <time dateTime={post.published_at} className="text-sm">
                {formatDate(post.published_at)}
              </time>
              {post.staff?.name && (
                <>
                  <span className="mx-3">•</span>
                  <span className="text-sm">{post.staff.name}</span>
                </>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {post.excerpt && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            )}
          </header>
        </div>

        {/* メイン画像 */}
        {post.image_url && (
          <div className="w-full">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* 本文 */}
        <div className="container-custom py-8">
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="text-gray-800 leading-relaxed"
            />
          </div>
        </div>

        {/* フッター */}
        <div className="container-custom border-t border-gray-200 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              最終更新: {formatDate(post.updated_at)}
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← ブログ一覧に戻る
            </Link>
          </div>
        </div>
      </article>

      {/* 関連記事セクション */}
      <section className="bg-gray-100 py-12">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            その他の記事
          </h2>
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              すべての記事を見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}