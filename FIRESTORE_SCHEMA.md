# Firestore データモデル設計

## 📊 Supabase → Firestore 移行マッピング

### コレクション構造概要

```
firestore/
├── daily_reports/           # 日報コレクション
│   └── {reportId}          # ドキュメント
├── short_stories/          # 小話コレクション
│   └── {storyId}
├── blog_posts/             # ブログ投稿コレクション
│   └── {postId}
├── owner_messages/         # オーナーメッセージコレクション
│   └── {messageId}
├── shorts/                 # ショート記事コレクション
│   └── {shortId}
└── monthly_messages/       # 月次メッセージコレクション
    └── {messageId}
```

---

## 1️⃣ daily_reports コレクション

### Supabaseテーブル定義（参考）
```sql
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID,
  staff_name TEXT NOT NULL,
  report_date DATE NOT NULL,
  weather_temperature TEXT,
  customer_attributes TEXT,
  visit_reason_purpose TEXT,
  treatment_details TEXT,
  customer_before_treatment TEXT,
  customer_after_treatment TEXT,
  salon_atmosphere TEXT,
  insights_innovations TEXT,
  kanae_personal_thoughts TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Firestoreドキュメント構造
```typescript
interface DailyReport {
  id: string                    // ドキュメントID（自動生成）
  staffId?: string              // スタッフID（オプション）
  staffName: string             // スタッフ名
  reportDate: string            // 報告日 (YYYY-MM-DD形式)
  weatherTemperature?: string   // 天気・気温
  customerAttributes?: string   // お客様の属性
  visitReasonPurpose?: string   // 来店理由・目的
  treatmentDetails?: string     // 施術内容
  customerBeforeTreatment?: string // 施術前の様子
  customerAfterTreatment?: string  // 施術後の反応
  salonAtmosphere?: string      // サロンの雰囲気
  insightsInnovations?: string  // 気づき・工夫
  kanaePersonalThoughts?: string // かなえの感想
  createdAt: Timestamp          // 作成日時
  updatedAt: Timestamp          // 更新日時
}
```

### インデックス（複合）
- `reportDate` (降順) - 日付順取得用
- `staffName`, `reportDate` (降順) - スタッフ別日報取得用

---

## 2️⃣ short_stories コレクション

### Supabaseテーブル定義（参考）
```sql
CREATE TABLE short_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_report_id UUID REFERENCES daily_reports(id),
  report_date DATE,
  weather_info TEXT,
  customer_type TEXT,
  key_moment TEXT,
  emotional_tone TEXT CHECK (emotional_tone IN ('heartwarming', 'inspiring', 'gentle')),
  status TEXT DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Firestoreドキュメント構造
```typescript
interface ShortStory {
  id: string                    // ドキュメントID
  title: string                 // タイトル
  content: string               // 本文
  sourceReportId?: string       // 元になった日報のID
  reportDate?: string           // 日報の日付
  weatherInfo?: string          // 天気情報
  customerType?: string         // お客様タイプ
  keyMoment?: string            // 重要な瞬間
  emotionalTone: 'heartwarming' | 'inspiring' | 'gentle' // 感情的トーン
  status: 'active' | 'archived' // ステータス
  isFeatured: boolean           // フィーチャー表示フラグ
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### インデックス
- `isFeatured`, `createdAt` (降順) - フィーチャー小話取得用
- `reportDate` (降順) - 日付順取得用
- `status`, `createdAt` (降順) - アクティブな小話取得用

---

## 3️⃣ blog_posts コレクション

### Supabaseテーブル定義（参考）
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE,
  week_start_date DATE,
  week_end_date DATE,
  source_reports_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'published')),
  author_name TEXT DEFAULT 'かなえ',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Firestoreドキュメント構造
```typescript
interface BlogPost {
  id: string                    // ドキュメントID
  title: string                 // タイトル
  content: string               // 本文（Markdown）
  slug?: string                 // URLスラッグ
  weekStartDate?: string        // 週の開始日
  weekEndDate?: string          // 週の終了日
  sourceReportsCount: number    // 元になった日報の数
  status: 'draft' | 'published' // ステータス
  authorName: string            // 著者名
  publishedAt?: Timestamp       // 公開日時
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### インデックス
- `status`, `createdAt` (降順) - 公開済み記事取得用
- `slug` - スラッグ検索用（ユニーク）

---

## 4️⃣ owner_messages コレクション

### Firestoreドキュメント構造
```typescript
interface OwnerMessage {
  id: string
  yearMonth: string             // YYYY-MM形式
  title: string
  bodyMd: string                // Markdown本文
  highlights: string[]          // ハイライト（配列）
  sources: string[]             // ソース情報（配列）
  status: 'draft' | 'published'
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
}
```

### インデックス
- `status`, `yearMonth` (降順)
- `yearMonth` - 年月検索用（ユニーク）

---

## 5️⃣ shorts コレクション

### Firestoreドキュメント構造
```typescript
interface Short {
  id: string
  title: string
  bodyMd: string                // Markdown本文
  tags: string[]                // タグ（配列）
  status: 'draft' | 'pending_review' | 'published'
  piiRiskScore: number          // 個人情報リスクスコア
  sourceReportIds: string[]     // 元になった日報IDの配列
  createdAt: Timestamp
  publishedAt?: Timestamp
  updatedAt: Timestamp
}
```

### インデックス
- `status`, `publishedAt` (降順)
- `tags` (配列メンバーシップ) - タグ検索用

---

## 6️⃣ monthly_messages コレクション

### Firestoreドキュメント構造
```typescript
interface MonthlyMessage {
  id: string
  yearMonth: string             // YYYY-MM形式
  message: string
  generatedAt: Timestamp
  sourceReportsCount: number
  isArchived: boolean
}
```

### インデックス
- `yearMonth` (降順)
- `isArchived`, `yearMonth` (降順)

---

## 🔍 Firestore vs Supabase の主な違い

### 1. プライマリキー
- **Supabase:** UUID自動生成
- **Firestore:** ドキュメントIDは自動生成（またはカスタム可能）

### 2. タイムスタンプ
- **Supabase:** `TIMESTAMP` 型、`NOW()` 関数
- **Firestore:** `Timestamp` 型、`FieldValue.serverTimestamp()` 使用

### 3. リレーション
- **Supabase:** 外部キー (`REFERENCES`) でリレーション
- **Firestore:** リレーションなし。ドキュメントID参照で擬似的に実現

### 4. 命名規則
- **Supabase:** スネークケース (`snake_case`)
- **Firestore:** キャメルケース (`camelCase`) を推奨（JavaScriptとの親和性）

### 5. クエリ制限
- **Supabase:** SQL - 複雑なJOIN可能
- **Firestore:** NoSQL - JOINなし、複合クエリに制約あり

---

## 📝 マイグレーションスクリプト例

### Supabaseからデータエクスポート

```typescript
// scripts/export-from-supabase.ts
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function exportData() {
  // 日報データ
  const { data: reports } = await supabase
    .from('daily_reports')
    .select('*')
    .order('report_date', { ascending: false })

  fs.writeFileSync('data/daily_reports.json', JSON.stringify(reports, null, 2))

  // 小話データ
  const { data: stories } = await supabase
    .from('short_stories')
    .select('*')
    .order('created_at', { ascending: false })

  fs.writeFileSync('data/short_stories.json', JSON.stringify(stories, null, 2))

  console.log('✅ データエクスポート完了')
}

exportData()
```

### Firestoreへインポート

```typescript
// scripts/import-to-firestore.ts
import { adminDb } from '../src/lib/firebaseAdmin'
import * as fs from 'fs'

async function importData() {
  // 日報データインポート
  const reports = JSON.parse(fs.readFileSync('data/daily_reports.json', 'utf-8'))
  const batch = adminDb.batch()

  reports.forEach((report: any) => {
    const docRef = adminDb.collection('daily_reports').doc()
    batch.set(docRef, {
      staffId: report.staff_id,
      staffName: report.staff_name,
      reportDate: report.report_date,
      weatherTemperature: report.weather_temperature,
      customerAttributes: report.customer_attributes,
      visitReasonPurpose: report.visit_reason_purpose,
      treatmentDetails: report.treatment_details,
      customerBeforeTreatment: report.customer_before_treatment,
      customerAfterTreatment: report.customer_after_treatment,
      salonAtmosphere: report.salon_atmosphere,
      insightsInnovations: report.insights_innovations,
      kanaePersonalThoughts: report.kanae_personal_thoughts,
      createdAt: new Date(report.created_at),
      updatedAt: new Date(report.updated_at),
    })
  })

  await batch.commit()
  console.log(`✅ ${reports.length}件の日報をインポートしました`)
}

importData()
```

---

## ✅ データ移行チェックリスト

- [ ] Firebase プロジェクト作成完了
- [ ] Firestore Database 有効化完了
- [ ] セキュリティルール設定完了
- [ ] インデックス作成完了
- [ ] Supabaseからデータエクスポート
- [ ] Firestoreへデータインポート
- [ ] データ整合性チェック（件数・内容確認）
- [ ] APIルート書き換え完了
- [ ] テスト実施・動作確認

---

**作成日:** 2025-10-11
