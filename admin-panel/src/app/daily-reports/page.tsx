'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DailyReport {
  id: string
  staff_name: string
  report_date: string
  weather_temperature: string
  customer_attributes: string
  visit_reason_purpose: string
  treatment_details: string
  customer_before_treatment: string
  customer_after_treatment: string
  salon_atmosphere: string
  insights_innovations: string
  kanae_personal_thoughts: string
  created_at: string
}

export default function DailyReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    staff_name: 'かなえ',
    report_date: new Date().toISOString().split('T')[0],
    weather_temperature: '',
    customer_attributes: '',
    visit_reason_purpose: '',
    treatment_details: '',
    customer_before_treatment: '',
    customer_after_treatment: '',
    salon_atmosphere: '',
    insights_innovations: '',
    kanae_personal_thoughts: ''
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/daily-reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('日報取得エラー:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.generatedStory) {
          alert(`日報が保存され、小話「${result.generatedStory.title}」が自動生成されました！`)
        } else {
          alert('日報が保存されました！')
        }
        
        setFormData({
          staff_name: 'かなえ',
          report_date: new Date().toISOString().split('T')[0],
          weather_temperature: '',
          customer_attributes: '',
          visit_reason_purpose: '',
          treatment_details: '',
          customer_before_treatment: '',
          customer_after_treatment: '',
          salon_atmosphere: '',
          insights_innovations: '',
          kanae_personal_thoughts: ''
        })
        setShowForm(false)
        fetchReports()
      } else {
        alert('保存に失敗しました。')
      }
    } catch (error) {
      console.error('送信エラー:', error)
      alert('送信エラーが発生しました。')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">日報管理</h1>
            <p className="text-gray-600 mt-2">スタッフの日報入力・管理システム</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              ← 管理画面に戻る
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              新規日報入力
            </button>
          </div>
        </div>

        {/* 日報入力フォーム */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">新規日報入力</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. 日付 *
                  </label>
                  <input
                    type="date"
                      value={formData.report_date}
                    onChange={(e) => setFormData({...formData, report_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. 天気・気温（季節感の演出用）
                  </label>
                  <input
                    type="text"
                    value={formData.weather_temperature}
                    onChange={(e) => setFormData({...formData, weather_temperature: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="例: 晴れ 25℃ 爽やかな春の日"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. お客様の属性（年代・性別・来店回数）
                </label>
                <input
                  type="text"
                  value={formData.customer_attributes}
                  onChange={(e) => setFormData({...formData, customer_attributes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例: 20代前半 女性 3回目来店"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4. お客様の来店のきっかけ・目的
                </label>
                <textarea
                  rows={3}
                  value={formData.visit_reason_purpose}
                  onChange={(e) => setFormData({...formData, visit_reason_purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例: 自己処理が大変、イベント前に整えたい など"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  5. 本日の施術内容（部位・時間・機器）
                </label>
                <textarea
                  rows={3}
                  value={formData.treatment_details}
                  onChange={(e) => setFormData({...formData, treatment_details: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例: 腕・脚の脱毛施術 約60分 光脱毛機使用"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    6. 施術前のお客様の様子（表情・不安や期待）
                  </label>
                  <textarea
                      rows={4}
                    value={formData.customer_before_treatment}
                    onChange={(e) => setFormData({...formData, customer_before_treatment: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="施術前のお客様の表情や気持ちを記録してください..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    7. 施術後のお客様の反応（感想・笑顔・変化）
                  </label>
                  <textarea
                      rows={4}
                    value={formData.customer_after_treatment}
                    onChange={(e) => setFormData({...formData, customer_after_treatment: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="施術後のお客様の感想や変化を記録してください..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  8. 今日のサロンの雰囲気や出来事（BGM・香り・小話）
                </label>
                <textarea
                  rows={3}
                  value={formData.salon_atmosphere}
                  onChange={(e) => setFormData({...formData, salon_atmosphere: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="サロンの雰囲気や会話の内容を記録してください..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  9. 今日の気づき・工夫（喜ばれた点や障害者向け配慮）
                </label>
                <textarea
                  rows={4}
                  value={formData.insights_innovations}
                  onChange={(e) => setFormData({...formData, insights_innovations: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="効果的だった配慮や工夫、気づきを記録してください..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  10. かなえさんのひと言感想（嬉しかったこと・明日への思い）
                </label>
                <textarea
                  rows={4}
                  value={formData.kanae_personal_thoughts}
                  onChange={(e) => setFormData({...formData, kanae_personal_thoughts: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="今日感じた喜びや明日への思いを記録してください..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 日報一覧 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">日報一覧</h2>
            <p className="text-gray-600 text-sm mt-1">登録済みの日報を確認できます（行をクリックで詳細表示）</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div key={report.id}>
                {/* 日報サマリー行 */}
                <div 
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(report.report_date).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {report.staff_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-700">
                          {report.customer_attributes}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          {report.weather_temperature.length > 30 
                            ? report.weather_temperature.substring(0, 30) + '...'
                            : report.weather_temperature
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          登録: {new Date(report.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          expandedReport === report.id ? 'rotate-90' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 詳細表示 */}
                {expandedReport === report.id && (
                  <div className="px-6 pb-6 bg-gray-50 border-t">
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            3. お客様の来店のきっかけ・目的
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {report.visit_reason_purpose}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            4. 本日の施術内容
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {report.treatment_details}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            5. 施術前のお客様の様子
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {report.customer_before_treatment}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            6. 施術後のお客様の反応
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {report.customer_after_treatment}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            7. 今日のサロンの雰囲気や出来事
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {report.salon_atmosphere}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            8. 今日の気づき・工夫
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {report.insights_innovations}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            9. かなえさんのひと言感想
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {report.kanae_personal_thoughts}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {reports.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                まだ日報が登録されていません。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}