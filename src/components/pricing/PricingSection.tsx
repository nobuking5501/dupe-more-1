'use client';

import React, { useState, useMemo } from 'react';
import { pricingData, discountTiers } from '@/data/pricing';
import PricingFilter from './PricingFilter';
import PriceTable from './PriceTable';
import PriceCard from './PriceCard';
import EstimateToast from './EstimateToast';

export default function PricingSection() {
  const [selectedSections, setSelectedSections] = useState<string[]>(() => 
    Array.from(new Set(pricingData.map(item => item.section)))
  );
  const [showSetEligibleOnly, setShowSetEligibleOnly] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showEstimate, setShowEstimate] = useState(false);

  // フィルタリングされたデータ
  const filteredData = useMemo(() => {
    let filtered = pricingData;

    // セクションフィルター
    if (selectedSections.length > 0) {
      filtered = filtered.filter(item => selectedSections.includes(item.section));
    }

    // セット対象のみフィルター
    if (showSetEligibleOnly) {
      filtered = filtered.filter(item => item.setEligible);
    }

    return filtered;
  }, [selectedSections, showSetEligibleOnly]);

  // アイテム選択処理
  const handleItemSelect = (area: string, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSelection = isSelected 
        ? [...prev, area]
        : prev.filter(item => item !== area);
      
      // 見積りトーストの表示制御
      setShowEstimate(newSelection.length > 0);
      
      return newSelection;
    });
  };

  // 見積りクリア
  const handleClearEstimate = () => {
    setSelectedItems([]);
    setShowEstimate(false);
  };

  // 現在の日付を取得
  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <section className="section-padding bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="container-custom">
        {/* セクションヘッダー */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            料金・メニュー
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            お子さま一人ひとりに合わせた、やさしい脱毛プランをご提案
          </p>
          
          {/* 注意書き */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 font-medium">
              ※ セット割は <span className="text-blue-600">☆</span> マークの部位のみ対象です。価格は税込です。
            </p>
          </div>
        </div>

        {/* フィルター */}
        <PricingFilter
          data={pricingData}
          selectedSections={selectedSections}
          showSetEligibleOnly={showSetEligibleOnly}
          onSectionChange={setSelectedSections}
          onSetEligibleToggle={setShowSetEligibleOnly}
        />

        {/* データが空の場合の表示 */}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">該当する項目が見つかりません</h3>
            <p className="text-gray-600 mb-4">フィルター条件を変更してお試しください。</p>
            <button
              onClick={() => {
                setSelectedSections(Array.from(new Set(pricingData.map(item => item.section))));
                setShowSetEligibleOnly(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              フィルターをリセット
            </button>
          </div>
        )}

        {/* 料金表 */}
        {filteredData.length > 0 && (
          <>
            {/* PC用テーブル */}
            <PriceTable
              data={filteredData}
              discountTiers={discountTiers}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
            />

            {/* SP用カード */}
            <PriceCard
              data={filteredData}
              discountTiers={discountTiers}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
            />
          </>
        )}

        {/* 見積りトースト */}
        {showEstimate && (
          <EstimateToast
            selectedItems={selectedItems}
            data={pricingData}
            discountTiers={discountTiers}
            onClose={() => setShowEstimate(false)}
            onClear={handleClearEstimate}
          />
        )}

        {/* よくある質問と予約導線 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              料金についてのご質問
            </h3>
            <p className="text-gray-600 mb-4">
              施術回数や支払い方法など、料金に関するよくあるご質問をまとめています。
            </p>
            <a
              href="/faq"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              よくある質問を見る
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">
              無料カウンセリング予約
            </h3>
            <p className="text-blue-100 mb-4">
              お子さまに最適なプランを無料でご提案いたします。
            </p>
            <a
              href="/contact"
              className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              予約する
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* 更新日 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          料金表最終更新日: {currentDate}
        </div>
      </div>
    </section>
  );
}