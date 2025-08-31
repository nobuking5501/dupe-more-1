'use client';

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
          
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 min-w-[200px]">
                部位
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-900 border-b border-gray-200 min-w-[120px]">
                価格（税込）
              </th>
              <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 min-w-[100px]">
                ☆セット対象
              </th>
              {discountTiers.map((tier) => (
                <th 
                  key={tier.places} 
                  scope="col" 
                  className="px-4 py-4 text-right text-sm font-semibold text-gray-900 border-b border-gray-200 min-w-[140px]"
                >
                  {tier.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groupedData.map((group, groupIndex) => (
              <React.Fragment key={group.section}>
                {/* セクション見出し行 */}
                <tr className="bg-blue-50">
                  <td 
                    colSpan={3 + discountTiers.length} 
                    className="px-6 py-3 text-sm font-bold text-gray-800 border-b border-gray-200"
                  >
                    {group.section}
                  </td>
                </tr>
                
                {/* 部位行 */}
                {group.items.map((item, itemIndex) => {
                  const isEven = itemIndex % 2 === 0;
                  const isSelected = selectedItems.includes(item.area);
                  
                  return (
                    <tr 
                      key={`${group.section}-${item.area}`}
                      className={`${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors ${isSelected ? 'ring-2 ring-blue-300' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          {item.setEligible && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => onItemSelect(item.area, e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              aria-label={`${item.area}を見積りに追加`}
                            />
                          )}
                          <span>{item.area}</span>
                          {item.setEligible && (
                            <>
                              <span className="text-blue-500" aria-hidden="true">☆</span>
                              <span className="sr-only">セット対象</span>
                            </>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-900 text-right border-b border-gray-100">
                        <span className="font-medium">{formatPrice(item.basePrice)}</span>
                        <span className="sr-only">税込</span>
                      </td>
                      
                      <td className="px-6 py-4 text-center border-b border-gray-100">
                        {item.setEligible ? (
                          <>
                            <span className="text-blue-500" aria-hidden="true">☆</span>
                            <span className="sr-only">セット割引対象</span>
                          </>
                        ) : (
                          <span className="text-gray-400" aria-label="セット割引対象外">—</span>
                        )}
                      </td>
                      
                      {discountTiers.map((tier) => (
                        <td 
                          key={tier.places} 
                          className="px-4 py-4 text-sm text-right border-b border-gray-100"
                        >
                          {item.setEligible ? (
                            <span className="font-medium text-green-600">
                              {formatPrice(calculateDiscountPrice(item.basePrice, tier.rate))}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      ))}
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

// React Fragment の import を追加
import React from 'react';