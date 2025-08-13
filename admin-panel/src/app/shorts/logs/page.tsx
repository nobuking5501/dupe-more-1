'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GenerationLog {
  id: string
  short_id?: string
  stage: 'sanitize' | 'draft' | 'audit' | 'publish'
  status: 'success' | 'error' | 'retry'
  elapsed_ms?: number
  model_name?: string
  tokens_used?: number
  input_data?: any
  output_data?: any
  error_message?: string
  created_at: string
  metadata?: any
}

interface LogsSummary {
  total: number
  success: number
  error: number
  retry: number
  stages: {
    sanitize: number
    draft: number
    audit: number
    publish: number
  }
  averageElapsedMs: number
}

export default function GenerationLogsPage() {
  const [logs, setLogs] = useState<GenerationLog[]>([])
  const [summary, setSummary] = useState<LogsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (stageFilter !== 'all') params.append('stage', stageFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/shorts/logs?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setLogs(result.data || [])
        setSummary(result.summary)
      } else {
        console.error('Failed to fetch logs:', result.error)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [stageFilter, statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'retry': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'sanitize': return '🧹'
      case 'draft': return '✏️'
      case 'audit': return '🔍'
      case 'publish': return '📢'
      default: return '⚙️'
    }
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'sanitize': return '正規化'
      case 'draft': return '草案作成'
      case 'audit': return '監査'
      case 'publish': return '公開'
      default: return stage
    }
  }

  if (loading) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto\"></div>
          <p className=\"mt-4 text-gray-600\">生成ログを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {/* Header */}
        <div className=\"sm:flex sm:items-center sm:justify-between\">
          <div>
            <div className=\"flex items-center space-x-2\">
              <Link href=\"/shorts\" className=\"text-blue-600 hover:text-blue-500\">
                ← 小話管理に戻る
              </Link>
            </div>
            <h1 className=\"text-2xl font-bold text-gray-900 mt-2\">生成ログ・テレメトリ</h1>
            <p className=\"mt-2 text-sm text-gray-700\">
              小話生成パイプラインの実行履歴とパフォーマンス統計
            </p>
          </div>
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className=\"mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4\">
            <div className=\"bg-white overflow-hidden shadow rounded-lg\">
              <div className=\"p-5\">
                <div className=\"flex items-center\">
                  <div className=\"flex-shrink-0\">
                    <div className=\"text-2xl\">📊</div>
                  </div>
                  <div className=\"ml-5 w-0 flex-1\">
                    <dl>
                      <dt className=\"text-sm font-medium text-gray-500 truncate\">総実行数</dt>
                      <dd className=\"text-lg font-medium text-gray-900\">{summary.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className=\"bg-white overflow-hidden shadow rounded-lg\">
              <div className=\"p-5\">
                <div className=\"flex items-center\">
                  <div className=\"flex-shrink-0\">
                    <div className=\"text-2xl\">✅</div>
                  </div>
                  <div className=\"ml-5 w-0 flex-1\">
                    <dl>
                      <dt className=\"text-sm font-medium text-gray-500 truncate\">成功率</dt>
                      <dd className=\"text-lg font-medium text-gray-900\">
                        {summary.total > 0 ? Math.round((summary.success / summary.total) * 100) : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className=\"bg-white overflow-hidden shadow rounded-lg\">
              <div className=\"p-5\">
                <div className=\"flex items-center\">
                  <div className=\"flex-shrink-0\">
                    <div className=\"text-2xl\">⚡</div>
                  </div>
                  <div className=\"ml-5 w-0 flex-1\">
                    <dl>
                      <dt className=\"text-sm font-medium text-gray-500 truncate\">平均実行時間</dt>
                      <dd className=\"text-lg font-medium text-gray-900\">{summary.averageElapsedMs}ms</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className=\"bg-white overflow-hidden shadow rounded-lg\">
              <div className=\"p-5\">
                <div className=\"flex items-center\">
                  <div className=\"flex-shrink-0\">
                    <div className=\"text-2xl\">🔴</div>
                  </div>
                  <div className=\"ml-5 w-0 flex-1\">
                    <dl>
                      <dt className=\"text-sm font-medium text-gray-500 truncate\">エラー数</dt>
                      <dd className=\"text-lg font-medium text-gray-900\">{summary.error}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className=\"mt-6 bg-white shadow rounded-lg p-4\">
          <div className=\"grid grid-cols-1 gap-4 sm:grid-cols-2\">
            <div>
              <label className=\"block text-sm font-medium text-gray-700\">ステージ</label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className=\"mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500\"
              >
                <option value=\"all\">すべて</option>
                <option value=\"sanitize\">正規化</option>
                <option value=\"draft\">草案作成</option>
                <option value=\"audit\">監査</option>
                <option value=\"publish\">公開</option>
              </select>
            </div>
            <div>
              <label className=\"block text-sm font-medium text-gray-700\">ステータス</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className=\"mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500\"
              >
                <option value=\"all\">すべて</option>
                <option value=\"success\">成功</option>
                <option value=\"error\">エラー</option>
                <option value=\"retry\">リトライ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className=\"mt-6\">
          {logs.length === 0 ? (
            <div className=\"text-center py-12\">
              <div className=\"text-gray-400 text-5xl mb-4\">📋</div>
              <h3 className=\"text-lg font-medium text-gray-900 mb-2\">ログがありません</h3>
              <p className=\"text-gray-500\">指定された条件に合うログが見つかりません。</p>
            </div>
          ) : (
            <div className=\"bg-white shadow overflow-hidden sm:rounded-md\">
              <ul className=\"divide-y divide-gray-200\">
                {logs.map((log) => (
                  <li key={log.id} className=\"px-6 py-4\">
                    <div className=\"flex items-start justify-between\">
                      <div className=\"flex-1\">
                        <div className=\"flex items-center space-x-3\">
                          <span className=\"text-xl\">{getStageIcon(log.stage)}</span>
                          <span className=\"text-sm font-medium text-gray-900\">
                            {getStageLabel(log.stage)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status === 'success' && '成功'}
                            {log.status === 'error' && 'エラー'}
                            {log.status === 'retry' && 'リトライ'}
                          </span>
                          {log.elapsed_ms && (
                            <span className=\"text-xs text-gray-500\">{log.elapsed_ms}ms</span>
                          )}
                        </div>

                        {log.error_message && (
                          <div className=\"mt-2 p-2 bg-red-50 rounded-md\">
                            <p className=\"text-sm text-red-800\">{log.error_message}</p>
                          </div>
                        )}

                        <div className=\"mt-2 grid grid-cols-2 gap-4 text-xs text-gray-500\">
                          <div>
                            <span className=\"font-medium\">実行日時:</span> {formatDate(log.created_at)}
                          </div>
                          {log.model_name && (
                            <div>
                              <span className=\"font-medium\">モデル:</span> {log.model_name}
                            </div>
                          )}
                          {log.tokens_used && (
                            <div>
                              <span className=\"font-medium\">トークン数:</span> {log.tokens_used}
                            </div>
                          )}
                          {log.short_id && (
                            <div>
                              <span className=\"font-medium\">小話ID:</span> {log.short_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
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