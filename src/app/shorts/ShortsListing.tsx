'use client'

import { useState, useEffect } from 'react'
import { ShortsClient, Short } from '@/lib/shorts-client'

interface ShortsListingProps {
  initialShorts: Short[]
  initialTotalPages: number
  initialTotalCount: number
  availableTags: string[]
}

export default function ShortsListing({ 
  initialShorts, 
  initialTotalPages, 
  initialTotalCount,
  availableTags 
}: ShortsListingProps) {
  const [shorts, setShorts] = useState<Short[]>(initialShorts)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  const fetchShorts = async (page: number = 1) => {
    setLoading(true)
    try {
      // Use admin-shorts API for latest Supabase data
      const adminResponse = await fetch('/api/admin-shorts')
      
      if (adminResponse.ok) {
        const adminShorts = await adminResponse.json()
        let filteredShorts = adminShorts

        // Apply search filter
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase()
          filteredShorts = adminShorts.filter((short: Short) =>
            short.title.toLowerCase().includes(query) ||
            short.body_md.toLowerCase().includes(query)
          )
        }

        // Apply tag filter
        if (selectedTag) {
          filteredShorts = adminShorts.filter((short: Short) =>
            short.tags.includes(selectedTag)
          )
        }

        // Apply pagination
        const pageSize = 12
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedShorts = filteredShorts.slice(start, end)

        setShorts(paginatedShorts)
        setTotalCount(filteredShorts.length)
        setTotalPages(Math.ceil(filteredShorts.length / pageSize))
        setCurrentPage(page)
      } else {
        // Fallback to ShortsClient
        let result

        if (searchQuery.trim()) {
          result = await ShortsClient.searchShorts(searchQuery.trim())
          setTotalPages(1)
          setCurrentPage(1)
        } else if (selectedTag) {
          result = await ShortsClient.getShortsByTag(selectedTag)
          setTotalPages(1)
          setCurrentPage(1)
        } else {
          result = await ShortsClient.getPaginatedShorts(page, 12)
          setTotalPages(result.totalPages)
          setCurrentPage(page)
        }

        if (result.data) {
          setShorts(result.data)
          setTotalCount(result.data.length)
        }
      }
    } catch (error) {
      console.error('Error fetching shorts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSelectedTag('')
    fetchShorts(1)
  }

  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag)
    setSearchQuery('')
    fetchShorts(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTag('')
    fetchShorts(1)
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const markdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/## (.+)/g, '<h2 class=\"text-xl font-semibold text-gray-900 mb-3 mt-6\">$1</h2>')
      .replace(/### (.+)/g, '<h3 class=\"text-lg font-semibold text-gray-800 mb-2 mt-4\">$1</h3>')
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      .replace(/\\n\\n/g, '</p><p class=\"text-gray-700 leading-relaxed mb-4\">')
      .replace(/\\n/g, '<br>')
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                placeholder="小話を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                検索
              </button>
            </form>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md ${viewMode === 'cards' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
              title="カード表示"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
              title="リスト表示"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 self-center">タグ:</span>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {(searchQuery || selectedTag) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                >
                  フィルタークリア
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">小話を読み込んでいます...</p>
        </div>
      )}

      {/* Shorts Display */}
      {!loading && (
        <>
          {viewMode === 'cards' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shorts.map((short) => (
                <article
                  key={short.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-lg font-semibold text-gray-900 flex-1">
                        {short.title}
                      </h2>
                      <time className="text-sm text-gray-500 ml-3 flex-shrink-0">
                        {formatDate(short.published_at)}
                      </time>
                    </div>

                    <div className="text-gray-700 leading-relaxed text-sm mb-4 whitespace-pre-line">
                      {short.body_md}
                    </div>

                    {short.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {short.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {shorts.map((short) => (
                <article
                  key={short.id}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-900 flex-1">
                      {short.title}
                    </h2>
                    <time className="text-sm text-gray-500 ml-4 flex-shrink-0">
                      {formatDate(short.published_at)}
                    </time>
                  </div>

                  <div className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                    {short.body_md}
                  </div>

                  {short.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {short.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !searchQuery && !selectedTag && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => fetchShorts(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>

              <span className="px-4 py-2 text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => fetchShorts(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}