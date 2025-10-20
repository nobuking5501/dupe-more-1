'use client';

import React, { useState } from 'react';
import { PricingItem, DiscountTier, formatPrice, calculateDiscountPrice, groupPricingBySection } from '@/data/pricing';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface PriceCardProps {
  data: PricingItem[];
  discountTiers: DiscountTier[];
  selectedItems: string[];
  onItemSelect: (area: string, isSelected: boolean) => void;
}

export default function PriceCard({ data, discountTiers, selectedItems, onItemSelect }: PriceCardProps) {
  const groupedData = groupPricingBySection(data);
  // デフォルトで全セクションを展開
  const [expandedSections, setExpandedSections] = useState<string[]>(() =>
    groupedData.map(group => group.section)
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="block lg:hidden">
      <div className="space-y-4">
        {groupedData.map((group) => {
          const isExpanded = expandedSections.includes(group.section);
          
          return (
            <div key={group.section} className="bg-white rounded-lg shadow-lg border-2 border-blue-200 overflow-hidden">
              {/* セクション見出し */}
              <button
                onClick={() => toggleSection(group.section)}
                className="w-full px-6 py-4 text-left bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={isExpanded}
                aria-controls={`section-${group.section}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{group.section}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {group.items.length}項目
                    </span>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>
              </button>

              {/* セクション内容 */}
              {isExpanded && (
                <div id={`section-${group.section}`} className="divide-y divide-gray-100">
                  {group.items.map((item, index) => {
                    const isSelected = selectedItems.includes(item.area);
                    
                    return (
                      <div
                        key={`${group.section}-${item.area}`}
                        className={`p-4 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      >
                        <div className="space-y-3">
                          {/* 部位名とチェックボックス */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center space-x-2 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => onItemSelect(item.area, e.target.checked)}
                                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0 cursor-pointer"
                                  aria-label={`${item.area}を見積りに追加`}
                                />
                                <h4 className="font-medium text-gray-900">{item.area}</h4>
                                {item.setEligible && (
                                  <span className="text-blue-500 text-lg" aria-hidden="true">☆</span>
                                )}
                              </label>
                              <span className="text-lg font-bold text-gray-900 ml-2">
                                {formatPrice(item.basePrice)}
                              </span>
                            </div>
                            {item.area === 'シェービング' && (
                              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded ml-7">
                                ※ うなじ・背中は手が届かないのでこちらで無料でシェービングしてます
                              </div>
                            )}
                          </div>

                          {/* 割引価格（セット対象のみ） */}
                          {item.setEligible && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded">
                                セット割引価格を見る（最大50%OFF）
                                <span className="sr-only">（{item.area}の割引価格一覧）</span>
                              </summary>

                              <div className="mt-3 space-y-2 pl-4 border-l-4 border-green-200">
                                {discountTiers.map((tier) => {
                                  const discountPrice = calculateDiscountPrice(item.basePrice, tier.rate);
                                  const savings = item.basePrice - discountPrice;

                                  return (
                                    <div
                                      key={tier.places}
                                      className="flex items-center justify-between text-sm bg-green-50 p-2 rounded"
                                    >
                                      <span className="text-gray-700 font-medium">{tier.label}</span>
                                      <div className="text-right">
                                        <div className="font-bold text-green-600">
                                          {formatPrice(discountPrice)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {formatPrice(savings)}お得
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          )}

                          {/* セット対象外の表示 */}
                          {!item.setEligible && (
                            <p className="text-sm text-gray-500">
                              ※ セット割引の対象外です
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}