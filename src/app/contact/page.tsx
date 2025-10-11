'use client'

import { useState } from 'react'
import Link from 'next/link'

type ContactType = 'customer' | 'media' | 'business'

interface FormData {
  type: ContactType
  name: string
  email: string
  phone: string
  subject: string
  message: string
  company?: string
  position?: string
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<ContactType>('customer')
  const [formData, setFormData] = useState<FormData>({
    type: 'customer',
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    company: '',
    position: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const tabs = [
    { id: 'customer' as ContactType, name: 'お客様お問い合わせ', icon: '👥' },
    { id: 'media' as ContactType, name: 'メディアお問い合わせ', icon: '📺' },
    { id: 'business' as ContactType, name: '企業お問い合わせ', icon: '🏢' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTabChange = (tab: ContactType) => {
    setActiveTab(tab)
    setFormData(prev => ({
      ...prev,
      type: tab,
      subject: '', // タブ変更時に件名をリセット
      company: '',
      position: ''
    }))
  }

  const getSubjectOptions = () => {
    switch (activeTab) {
      case 'customer':
        return [
          '初回カウンセリングについて',
          '料金・プランについて',
          '施術内容について',
          '予約・キャンセルについて',
          'アクセス・営業時間について',
          'その他のご質問'
        ]
      case 'media':
        return [
          '取材のお申し込み',
          '資料提供のお願い',
          '専門家コメントの依頼',
          'その他メディア関連'
        ]
      case 'business':
        return [
          '業務提携について',
          '求人・採用について',
          '企業研修について',
          'その他企業関連'
        ]
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // メール送信の処理をシミュレート
      const emailBody = `
お問い合わせ種別: ${tabs.find(tab => tab.id === formData.type)?.name}
お名前: ${formData.name}
メールアドレス: ${formData.email}
電話番号: ${formData.phone}
${formData.company ? `会社名: ${formData.company}` : ''}
${formData.position ? `役職: ${formData.position}` : ''}
件名: ${formData.subject}

お問い合わせ内容:
${formData.message}
      `.trim()

      // mailto リンクを生成
      const mailtoLink = `mailto:dupe.more531@gmail.com?subject=${encodeURIComponent(`【${tabs.find(tab => tab.id === formData.type)?.name}】${formData.subject}`)}&body=${encodeURIComponent(emailBody)}`
      
      // メールクライアントを開く
      window.location.href = mailtoLink

      setSubmitMessage('メールクライアントが開きます。送信を完了してください。')
      
      // フォームをリセット
      setTimeout(() => {
        setFormData({
          type: activeTab,
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          company: '',
          position: ''
        })
        setSubmitMessage('')
      }, 3000)

    } catch (error) {
      setSubmitMessage('エラーが発生しました。お手数ですが、直接メールでお問い合わせください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-8">
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">お問い合わせ</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            お問い合わせ
          </h1>
          <p className="text-lg text-gray-600">
            ご不明な点やご相談がございましたら、お気軽にお問い合わせください
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          {/* LINE お問い合わせ */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl mr-3">💬</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    公式LINEからお問い合わせ
                  </h3>
                  <p className="text-sm text-gray-600">
                    お気軽にLINEでご相談ください。迅速に対応いたします。
                  </p>
                </div>
              </div>
              <a
                href="https://lin.ee/YSahAAB"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors"
              >
                <span className="mr-2">📱</span>
                LINEで相談
              </a>
            </div>
          </div>
          {/* タブナビゲーション */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 bg-primary-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-2">{tab.icon}</span>
                    <span className="block">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* フォーム */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="山田 太郎"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="075-531-3222"
                    />
                  </div>

                  {(activeTab === 'media' || activeTab === 'business') && (
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTab === 'media' ? '媒体名・会社名' : '会社名'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder={activeTab === 'media' ? '○○テレビ / ○○新聞社' : '株式会社○○'}
                      />
                    </div>
                  )}
                </div>

                {(activeTab === 'media' || activeTab === 'business') && (
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                      役職・部署
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder={activeTab === 'media' ? '記者 / ディレクター' : '営業部 / 人事部'}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ件名 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">選択してください</option>
                    {getSubjectOptions().map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder={
                      activeTab === 'customer' 
                        ? 'お子さまの年齢、障害の種類、脱毛に対するご希望など、詳しくお聞かせください。'
                        : activeTab === 'media'
                        ? '取材の目的、希望する内容、スケジュールなどをお聞かせください。'
                        : '提携内容、ご希望の条件など、詳しくお聞かせください。'
                    }
                  />
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-md ${submitMessage.includes('エラー') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {submitMessage}
                  </div>
                )}

                <div className="flex items-center justify-between pt-6">
                  <p className="text-sm text-gray-500">
                    <span className="text-red-500">*</span> は必須項目です
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? '送信中...' : 'お問い合わせを送信'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 連絡先情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                サロン情報
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-primary-600 mr-3">📍</span>
                  <div>
                    <p className="font-medium text-gray-900">住所</p>
                    <p>〒605-0075<br />京都市東山区大和大路西入ル中之町200カモガワビル2F</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-primary-600 mr-3">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">電話番号</p>
                    <p>075-531-3222</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-primary-600 mr-3">📧</span>
                  <div>
                    <p className="font-medium text-gray-900">メール</p>
                    <p>dupe.more531@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                営業時間
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-primary-600 mr-3">⏰</span>
                  <div>
                    <p className="font-medium text-gray-900">営業時間</p>
                    <p>10:00 - 21:00</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-primary-600 mr-3">📅</span>
                  <div>
                    <p className="font-medium text-gray-900">定休日</p>
                    <p>月曜日</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>初回カウンセリング無料</strong><br />
                    お子さまの状況に合わせた最適なプランをご提案いたします
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}