'use client';

import React, { useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PricingItem, DiscountTier, formatPrice, calculateDiscountPrice } from '@/data/pricing';

interface EstimateToastProps {
  selectedItems: string[];
  data: PricingItem[];
  discountTiers: DiscountTier[];
  onClose: () => void;
  onClear: () => void;
}

export default function EstimateToast({ selectedItems, data, discountTiers, onClose, onClear }: EstimateToastProps) {
  const estimate = useMemo(() => {
    if (selectedItems.length === 0) return null;

    const selectedData = data.filter(item => selectedItems.includes(item.area));
    if (selectedData.length === 0) return null;

    // セット対象の項目のみを抽出
    const setEligibleData = selectedData.filter(item => item.setEligible);

    // 全項目の合計
    const totalBase = selectedData.reduce((sum, item) => sum + item.basePrice, 0);

    // 最適な割引率を決定（セット対象項目の数で判定）
    let bestDiscount = 0;
    let bestDiscountLabel = '';

    for (const tier of discountTiers) {
      if (setEligibleData.length >= tier.places) {
        bestDiscount = tier.rate;
        bestDiscountLabel = tier.label;
      }
    }

    // 割引後の合計（セット対象は割引、非対象はそのまま）
    const discountedTotal = selectedData.reduce((sum, item) => {
      if (item.setEligible) {
        return sum + calculateDiscountPrice(item.basePrice, bestDiscount);
      } else {
        return sum + item.basePrice;
      }
    }, 0);

    const savings = totalBase - discountedTotal;

    return {
      items: selectedData,
      count: selectedData.length,
      setEligibleCount: setEligibleData.length,
      totalBase,
      discountedTotal,
      savings,
      discountLabel: bestDiscountLabel,
      discountRate: bestDiscount
    };
  }, [selectedItems, data, discountTiers]);

  if (!estimate || selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 md:top-4 md:bottom-auto z-50 w-[calc(100%-2rem)] md:w-80 max-w-sm transition-all duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-400 overflow-hidden transform transition-all duration-300">
        {/* ヘッダー */}
        <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              見積り <span className="text-sm font-normal text-gray-600">({estimate.count}箇所)</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors"
              aria-label="見積りを閉じる"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-3">
          {/* 選択アイテム一覧 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">選択部位</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {estimate.items.map((item) => (
                <div key={item.area} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    {item.area}
                    {item.setEligible && (
                      <span className="text-blue-500 text-xs">☆</span>
                    )}
                  </span>
                  <span className="font-medium">{formatPrice(item.basePrice)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 価格サマリー */}
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">小計</span>
              <span>{formatPrice(estimate.totalBase)}</span>
            </div>

            {estimate.discountRate > 0 && (
              <>
                <div className="bg-green-50 px-3 py-2 rounded-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700 font-medium flex items-center gap-1">
                      <span className="text-blue-500">☆</span>
                      セット割 {estimate.setEligibleCount}箇所
                    </span>
                    <span className="text-green-600 font-semibold">{estimate.discountLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">割引額</span>
                    <span className="text-green-600 font-bold">-{formatPrice(estimate.savings)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">合計（税込）</span>
                    <span className="text-xl font-bold text-blue-600">{formatPrice(estimate.discountedTotal)}</span>
                  </div>
                </div>
              </>
            )}

            {estimate.discountRate === 0 && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">合計（税込）</span>
                <span className="text-xl font-bold text-gray-800">{formatPrice(estimate.totalBase)}</span>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-2 pt-3">
            <button
              onClick={onClear}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              クリア
            </button>
            <button
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                // 実装: お問い合わせフォームに遷移または見積り詳細を表示
                window.location.href = '/contact';
              }}
            >
              お問合せ
            </button>
          </div>

          {/* 注意事項 */}
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded space-y-1">
            <p className="font-medium">※ セット割引は☆マーク付き部位のみ適用されます</p>
            <p>※ この見積りは参考価格です。実際の料金は無料カウンセリングにてご相談ください。</p>
          </div>
        </div>
      </div>
    </div>
  );
}