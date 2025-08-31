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
  { section: "顔", area: "両頰", basePrice: 8000, setEligible: true },
  { section: "顔", area: "顎", basePrice: 6000, setEligible: true },
  { section: "顔", area: "口周り", basePrice: 5000, setEligible: true },
  { section: "顔", area: "額", basePrice: 7000, setEligible: true },
  { section: "顔", area: "眉間", basePrice: 3000, setEligible: true },
  { section: "顔", area: "鼻下", basePrice: 4000, setEligible: true },
  
  // 手部位
  { section: "手", area: "両腕（肘上）", basePrice: 15000, setEligible: true },
  { section: "手", area: "両腕（肘下）", basePrice: 12000, setEligible: true },
  { section: "手", area: "両手の甲・指", basePrice: 8000, setEligible: true },
  { section: "手", area: "両脇", basePrice: 10000, setEligible: true },
  
  // 足部位
  { section: "足", area: "両脚（膝上）", basePrice: 20000, setEligible: true },
  { section: "足", area: "両脚（膝下）", basePrice: 18000, setEligible: true },
  { section: "足", area: "両足の甲・指", basePrice: 8000, setEligible: true },
  { section: "足", area: "膝", basePrice: 6000, setEligible: true },
  
  // VIO部位
  { section: "VIO", area: "Vライン", basePrice: 12000, setEligible: true },
  { section: "VIO", area: "Iライン", basePrice: 10000, setEligible: true },
  { section: "VIO", area: "Oライン", basePrice: 8000, setEligible: true },
  
  // 身体-前面
  { section: "身体-前面", area: "胸", basePrice: 15000, setEligible: true },
  { section: "身体-前面", area: "お腹", basePrice: 12000, setEligible: true },
  { section: "身体-前面", area: "へそ周り", basePrice: 5000, setEligible: true },
  
  // 身体-背面  
  { section: "身体-背面", area: "うなじ", basePrice: 8000, setEligible: true },
  { section: "身体-背面", area: "背中（上）", basePrice: 15000, setEligible: true },
  { section: "身体-背面", area: "背中（下）", basePrice: 15000, setEligible: true },
  { section: "身体-背面", area: "腰", basePrice: 10000, setEligible: true },
  { section: "身体-背面", area: "ヒップ", basePrice: 12000, setEligible: true },
  
  // オプション（セット対象外）
  { section: "オプション", area: "シェービング", basePrice: 2000, setEligible: false },
  { section: "オプション", area: "アフターケア", basePrice: 1500, setEligible: false },
  { section: "オプション", area: "カウンセリング延長", basePrice: 3000, setEligible: false }
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