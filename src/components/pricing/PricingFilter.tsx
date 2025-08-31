'use client';

import React from 'react';
import { PricingItem } from '@/data/pricing';

interface PricingFilterProps {
  data: PricingItem[];
  selectedSections: string[];
  showSetEligibleOnly: boolean;
  onSectionChange: (sections: string[]) => void;
  onSetEligibleToggle: (showOnly: boolean) => void;
}

export default function PricingFilter({ 
  data, 
  selectedSections, 
  showSetEligibleOnly, 
  onSectionChange, 
  onSetEligibleToggle 
}: PricingFilterProps) {
  const allSections = Array.from(new Set(data.map(item => item.section)));

  const handleSectionToggle = (section: string) => {
    if (selectedSections.includes(section)) {
      onSectionChange(selectedSections.filter(s => s !== section));
    } else {
      onSectionChange([...selectedSections, section]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSections.length === allSections.length) {
      onSectionChange([]);
    } else {
      onSectionChange(allSections);
    }
  };

  const getSectionIcon = (section: string) => {
    const icons: Record<string, string> = {
      '顔': '👤',
      '手': '✋',
      '足': '🦵',
      'VIO': '💫',
      '身体-前面': '🫁',
      '身体-背面': '🫂',
      'オプション': '⚙️'
    };
    return icons[section] || '📍';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="space-y-6">
        {/* セット対象のみフィルター */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">絞り込み条件</h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSetEligibleOnly}
              onChange={(e) => onSetEligibleToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">セット対象のみ表示</span>
            <span className="text-blue-500" aria-hidden="true">☆</span>
          </label>
        </div>

        {/* 部位フィルター */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800">部位選択</h4>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded px-2 py-1"
            >
              {selectedSections.length === allSections.length ? '全て解除' : '全て選択'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {allSections.map((section) => {
              const isSelected = selectedSections.includes(section);
              
              return (
                <button
                  key={section}
                  onClick={() => handleSectionToggle(section)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  `}
                  aria-pressed={isSelected}
                  aria-label={`${section}の部位を${isSelected ? '除外' : '含める'}`}
                >
                  <span aria-hidden="true">{getSectionIcon(section)}</span>
                  <span className="truncate">{section}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* フィルター結果サマリー */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {selectedSections.length === 0 ? '全部位' : `${selectedSections.length}部位`}を表示中
              {showSetEligibleOnly && ' (セット対象のみ)'}
            </span>
            {(selectedSections.length > 0 && selectedSections.length < allSections.length) || showSetEligibleOnly ? (
              <button
                onClick={() => {
                  onSectionChange(allSections);
                  onSetEligibleToggle(false);
                }}
                className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded px-2 py-1"
              >
                フィルターをクリア
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}