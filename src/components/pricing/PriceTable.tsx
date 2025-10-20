'use client';

import React from 'react';
import { PricingItem, DiscountTier, formatPrice, calculateDiscountPrice, groupPricingBySection } from '@/data/pricing';

interface PriceTableProps {
  data: PricingItem[];
  discountTiers: DiscountTier[];
  selectedItems: string[];
  onItemSelect: (area: string, isSelected: boolean) => void;
}

export default function PriceTable({ data, discountTiers, selectedItems, onItemSelect }: PriceTableProps) {
  const groupedData = groupPricingBySection(data);

  return (
    <div className="hidden lg:block">
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="w-full bg-white" role="table" aria-label="料金表">
          <caption className="sr-only">
            Dupe＆more の施術部位別料金表。セット割引対象部位には☆マークが付いています。
          </caption>

          <thead className="sticky top-0 bg-gradient-to-r from-blue-100 to-blue-50 z-10">
            <tr>
              <th scope="col" className="px-6 py-4 text-center text-base font-bold text-gray-900 border-b-2 border-blue-400 w-32">
                部位
              </th>
              <th scope="col" className="px-6 py-4 text-left text-base font-bold text-gray-900 border-b-2 border-blue-400">
                選択
              </th>
              <th scope="col" className="px-6 py-4 text-right text-base font-bold text-gray-900 border-b-2 border-blue-400 min-w-[120px]">
                価格（税込）
              </th>
              <th scope="col" className="px-6 py-4 text-center text-base font-bold text-gray-900 border-b-2 border-blue-400 min-w-[100px]">
                セット対象
              </th>
              <th scope="col" className="px-4 py-4 text-right text-sm font-bold text-gray-900 border-b-2 border-blue-400 min-w-[110px]">
                2箇所<br/>(20%OFF)
              </th>
              <th scope="col" className="px-4 py-4 text-right text-sm font-bold text-gray-900 border-b-2 border-blue-400 min-w-[110px]">
                3箇所<br/>(30%OFF)
              </th>
              <th scope="col" className="px-4 py-4 text-right text-sm font-bold text-gray-900 border-b-2 border-blue-400 min-w-[110px]">
                4箇所<br/>(40%OFF)
              </th>
              <th scope="col" className="px-4 py-4 text-right text-sm font-bold text-gray-900 border-b-2 border-blue-400 min-w-[110px]">
                5箇所以上<br/>(50%OFF)
              </th>
            </tr>
          </thead>

          <tbody>
            {groupedData.map((group, groupIndex) => (
              <React.Fragment key={group.section}>
                {group.items.map((item, itemIndex) => {
                  const isSelected = selectedItems.includes(item.area);
                  const isFirstInGroup = itemIndex === 0;
                  const isLastInGroup = itemIndex === group.items.length - 1;

                  return (
                    <tr
                      key={`${group.section}-${item.area}`}
                      className={`hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-100' : groupIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      {/* セクション名（最初の行のみ表示） */}
                      {isFirstInGroup && (
                        <td
                          rowSpan={group.items.length}
                          className="px-4 py-4 text-center font-bold text-gray-800 bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-r-4 border-t-4 border-b-4 border-blue-400 align-middle"
                        >
                          <div className="text-lg">{group.section}</div>
                        </td>
                      )}

                      {/* 選択 */}
                      <td className={`px-6 py-3 text-sm text-gray-900 border-r border-gray-200 ${isFirstInGroup ? 'border-t-4 border-t-blue-400' : ''} ${isLastInGroup ? 'border-b-4 border-b-blue-400' : 'border-b border-gray-200'}`}>
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onItemSelect(item.area, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer mt-0.5 flex-shrink-0"
                            aria-label={`${item.area}を見積りに追加`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.area}</span>
                              {item.setEligible && (
                                <span className="text-blue-500 text-lg" aria-hidden="true">☆</span>
                              )}
                            </div>
                            {item.area === 'シェービング' && (
                              <div className="text-xs text-gray-600 mt-1">
                                ※ うなじ・背中は手が届かないので<br/>こちらで無料でシェービングしてます
                              </div>
                            )}
                          </div>
                        </label>
                      </td>

                      {/* 価格 */}
                      <td className={`px-6 py-3 text-base text-gray-900 text-right border-r border-gray-200 ${isFirstInGroup ? 'border-t-4 border-t-blue-400' : ''} ${isLastInGroup ? 'border-b-4 border-b-blue-400' : 'border-b border-gray-200'}`}>
                        <span className="font-bold text-blue-600">{formatPrice(item.basePrice)}</span>
                      </td>

                      {/* セット対象 */}
                      <td className={`px-6 py-3 text-center border-r-2 border-gray-300 ${isFirstInGroup ? 'border-t-4 border-t-blue-400' : ''} ${isLastInGroup ? 'border-b-4 border-b-blue-400' : 'border-b border-gray-200'}`}>
                        {item.setEligible ? (
                          <span className="text-blue-500 text-xl" aria-hidden="true">☆</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* 2箇所割引 */}
                      <td className={`px-4 py-3 text-sm text-right border-r border-gray-200 ${isFirstInGroup ? 'border-t-4 border-t-blue-400' : ''} ${isLastInGroup ? 'border-b-4 border-b-blue-400' : 'border-b border-gray-200'}`}>
                        {item.setEligible ? (
                          <span className="font-semibold text-green-600">
                            {formatPrice(calculateDiscountPrice(item.basePrice, 0.20))}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* 3箇所割引 */}
                      <td className={`px-4 py-3 text-sm text-right border-r border-gray-200 ${isFirstInGroup ? 'border-t-4 border-t-blue-400' : ''} ${isLastInGroup ? 'border-b-4 border-b-blue-400' : 'border-b border-gray-200'}`}>
                        {item.setEligible ? (
                          <span className="font-semibold text-green-600">
                            {formatPrice(calculateDiscountPrice(item.basePrice, 0.30))}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* 4箇所割引 */}
                      <td className={`px-4 py-3 text-sm text-right border-r border-gray-200 ${isFirstInGroup ? 'border-t-4 border-t-blue-400' : ''} ${isLastInGroup ? 'border-b-4 border-b-blue-400' : 'border-b border-gray-200'}`}>
                        {item.setEligible ? (
                          <span className="font-semibold text-green-600">
                            {formatPrice(calculateDiscountPrice(item.basePrice, 0.40))}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* 5箇所以上割引 */}
                      <td className={`px-4 py-3 text-sm text-right border-r-4 border-r-blue-400 ${isFirstInGroup ? 'border-t-4 border-t-blue-400' : ''} ${isLastInGroup ? 'border-b-4 border-b-blue-400' : 'border-b border-gray-200'}`}>
                        {item.setEligible ? (
                          <span className="font-semibold text-green-600">
                            {formatPrice(calculateDiscountPrice(item.basePrice, 0.50))}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}