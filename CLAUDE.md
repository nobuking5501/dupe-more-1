# Claude Development Notes

## プロジェクト構成
- admin-panel: 管理者用パネル (ポート3001)
- public-site: 公開サイト (ポート3000)
- 共有コンポーネント

## 開発環境セットアップ
### 管理者パネル起動
```bash
cd admin-panel
npm run dev  # http://localhost:3001
```

### 公開サイト起動
```bash
cd public-site
npm run dev  # http://localhost:3000
```

## UI崩れ防止のためのチェックリスト

### ビルド前チェック
1. ESLintエラーの修正
```bash
npm run build
```

2. 型エラーの確認
```bash
npm run type-check  # または tsc --noEmit
```

3. 警告の対処
- 未エスケープ文字: `"` → `&ldquo;` `&rdquo;`
- img要素: `<img>` → `<Image from next/image>`

### 開発中のベストプラクティス
- 変更後は必ずビルドテストを実行
- ESLintルールに従う
- TypeScript型安全性を保持
- レスポンシブデザイン確認

### データベース設定
- Supabase環境変数が必要
- owner_messages テーブル存在確認
- 本番では適切なRLS設定

## トラブルシューティング

### Next.jsアセット404エラーの対処
```bash
# キャッシュクリア
rm -rf .next node_modules/.cache

# サーバー再起動
npm run dev
```

### サーバーポート競合の解決
```bash
# プロセス確認
ss -tlnp | grep -E ":300[012]"

# 強制終了
pkill -f "next dev"
```

## 今日の小話機能

### 自動生成パイプライン
1. **正規化 (Sanitize)**: 日報から安全な要約を作成
2. **草案 (Draft)**: 要約から150-250字の小話を生成
3. **監査 (Audit)**: PII/表現リスクを検査、リスクスコア算出
4. **公開 (Publish)**: リスクスコア≤20で自動公開、それ以外はレビュー待ち

### Cron設定（毎朝09:00 JST）
```bash
# Vercel Cron Jobs設定例 (vercel.json)
{
  "crons": [{
    "path": "/api/cron/generate-daily",
    "schedule": "0 0 * * *"
  }]
}

# 外部Cronサービス (cron-job.org等)
URL: https://your-admin-domain.vercel.app/api/cron/generate-daily
Method: GET
Headers: Authorization: Bearer YOUR_CRON_SECRET
Schedule: 0 9 * * * (JST)
```

### 環境変数
```bash
# admin-panel/.env.local
CRON_SECRET=your-secure-random-string
SUPABASE_WEBHOOK_SECRET=another-secure-string
NEXT_PUBLIC_SITE_URL=https://your-public-site.vercel.app
REVALIDATE_SECRET=yet-another-secure-string

# public-site/.env.local  
REVALIDATE_SECRET=yet-another-secure-string
NEXT_PUBLIC_SITE_URL=https://your-public-site.vercel.app
```

### API エンドポイント
**管理画面 (admin-panel):**
- `/api/shorts/generate` - 手動生成
- `/api/shorts/webhook` - 日報保存時トリガー
- `/api/cron/generate-daily` - 毎日09:00 JST実行
- `/api/shorts/logs` - 生成ログ取得
- `/api/shorts` - 小話CRUD
- `/api/shorts/[id]` - 小話個別操作

**公開サイト (public-site):**
- `/api/revalidate` - ISR再検証
- `/shorts` - 小話一覧ページ
- `/sitemap.xml` - 動的サイトマップ

## 最近の修正履歴
- 2025-08-13: Next.jsアセット404エラー修正（キャッシュクリア）
- 2025-08-13: サーバー競合問題解決
- 2025-08-13: testimonials/page.tsx ESLintエラー修正
- 2025-08-13: ヘッダーメニュー文字列短縮化
- 2025-08-13: UI崩れ防止チェックリスト追加

## 開発者向けコマンド
```bash
# ビルドテスト
npm run build

# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# Lint修正
npm run lint -- --fix
```