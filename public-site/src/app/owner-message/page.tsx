'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase-client';

interface OwnerMessage {
  id: string;
  year_month: string;
  title: string;
  body_md: string;
  highlights: string[];
  published_at: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${year}年${parseInt(month)}月`;
}

function renderMarkdown(markdown: string): JSX.Element {
  // 簡単なマークダウンレンダリング
  const lines = markdown.split('\n');
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, index) => {
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
          {line.replace('## ', '')}
        </h3>
      );
    } else if (line.trim() !== '') {
      elements.push(
        <p key={index} className="text-gray-700 mb-4 leading-relaxed">
          {line}
        </p>
      );
    }
  });
  
  return <div className="prose max-w-none">{elements}</div>;
}

export default function OwnerMessagePage() {
  const [messages, setMessages] = useState<OwnerMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const supabase = createSupabaseClient();
        
        const { data, error } = await supabase
          .from('owner_messages')
          .select('id, year_month, title, body_md, highlights, published_at')
          .eq('status', 'published')
          .order('year_month', { ascending: false })
          .limit(12);

        if (error) {
          console.error('オーナーメッセージ取得エラー:', error);
        } else {
          setMessages(data || []);
        }
      } catch (error) {
        console.error('メッセージ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-gray-500 text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* ヒーローセクション */}
        <div className="bg-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              オーナーメッセージ
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dupe&moreオーナーからお客様へのメッセージです。日々の想いや学びを共有させていただいています。
            </p>
          </div>
        </div>

        {/* メッセージ一覧 */}
        <div className="container mx-auto px-4 py-16">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                現在、公開中のメッセージはございません。
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-12">
              {messages.map((message, index) => (
                <article 
                  key={message.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {/* メッセージ本文 */}
                  <div className="px-8 py-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {message.title}
                      </h2>
                      <div className="text-sm text-gray-600">
                        {formatDate(message.published_at)}
                      </div>
                    </div>
                    
                    {/* ハイライト */}
                    {message.highlights && message.highlights.length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {message.highlights.map((highlight, highlightIndex) => (
                            <span
                              key={highlightIndex}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {renderMarkdown(message.body_md)}
                  </div>

                  {/* メッセージフッター */}
                  <div className="bg-gray-50 px-8 py-4 border-t">
                    <div className="text-right text-sm text-gray-500">
                      {formatYearMonth(message.year_month)}のメッセージ
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* お問い合わせCTA */}
          <div className="mt-20 text-center">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ご質問・ご相談はお気軽に
              </h3>
              <p className="text-gray-600 mb-6">
                サロンについてご不明な点がございましたら、お気軽にお問い合わせください。
              </p>
              <a
                href="/contact"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}