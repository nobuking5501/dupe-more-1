// 料金データ
export interface PricingItem {
  section: string;
  area: string;
  basePrice: number;
  setEligible: boolean;
}

export interface DiscountTier {
  places: number;
  label: string;
  rate: number;
}

export const pricingData: PricingItem[] = [
  // 顔部位
  { section: "顔", area: "男性:髭のみ", basePrice: 6600, setEligible: true },
  { section: "顔", area: "女性:全顔", basePrice: 6600, setEligible: true },
  { section: "顔", area: "ホホ（オプション）", basePrice: 1100, setEligible: false },
  { section: "顔", area: "おでこ（オプション）", basePrice: 1100, setEligible: false },

  // 手
  { section: "手", area: "両腕（二の腕+ひじ下）", basePrice: 8800, setEligible: true },
  { section: "手", area: "二の腕のみ", basePrice: 4400, setEligible: false },
  { section: "手", area: "ひじ下のみ", basePrice: 4400, setEligible: false },
  { section: "手", area: "両手（甲・指）", basePrice: 1100, setEligible: false },

  // 足
  { section: "足", area: "両足（もも+すね）", basePrice: 8800, setEligible: true },
  { section: "足", area: "もものみ", basePrice: 4400, setEligible: false },
  { section: "足", area: "すねのみ", basePrice: 4400, setEligible: false },
  { section: "足", area: "両足の甲", basePrice: 1100, setEligible: false },

  // VIO部位
  { section: "VIO", area: "VIO（ハイジニーナ）", basePrice: 8800, setEligible: true },
  { section: "VIO", area: "Vライン（単部位）", basePrice: 3300, setEligible: false },
  { section: "VIO", area: "Iライン（単部位）", basePrice: 3300, setEligible: false },
  { section: "VIO", area: "Oライン", basePrice: 3300, setEligible: false },

  // 身体（前面）
  { section: "身体（前面）", area: "胸", basePrice: 6600, setEligible: true },
  { section: "身体（前面）", area: "お腹", basePrice: 6600, setEligible: true },
  { section: "身体（前面）", area: "両ワキ", basePrice: 2200, setEligible: false },

  // 身体（背面）
  { section: "身体（背面）", area: "うなじ", basePrice: 2200, setEligible: false },
  { section: "身体（背面）", area: "背中", basePrice: 8800, setEligible: true },
  { section: "身体（背面）", area: "おしり", basePrice: 6600, setEligible: true },

  // その他
  { section: "その他", area: "シェービング", basePrice: 1100, setEligible: false }
];

export const discountTiers: DiscountTier[] = [
  { places: 2, label: "2箇所(20%OFF)", rate: 0.20 },
  { places: 3, label: "3箇所(30%OFF)", rate: 0.30 },
  { places: 4, label: "4箇所(40%OFF)", rate: 0.40 },
  { places: 5, label: "5箇所以上(50%OFF)", rate: 0.50 }
];

// 価格フォーマット関数
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price);
};

// 割引価格計算関数
export const calculateDiscountPrice = (basePrice: number, discountRate: number): number => {
  return Math.round(basePrice * (1 - discountRate));
};

// セクションごとのグループ化
export const groupPricingBySection = (data: PricingItem[]) => {
  const sections = Array.from(new Set(data.map(item => item.section)));
  return sections.map(section => ({
    section,
    items: data.filter(item => item.section === section)
  }));
};