# 月次メッセージ自動更新システム

## 概要
障害をお持ちのお子様の保護者様に向けた月次メッセージを、スタッフの日報データから Claude API を使用して自動生成・更新するシステムです。

## システム構成

### 1. データベーステーブル
- `monthly_messages`: 月次メッセージを保存
- `daily_reports`: スタッフの日報データ（既存）

### 2. API エンドポイント
- `GET /api/monthly-message`: 現在の月のメッセージを取得
- `POST /api/monthly-message`: 手動でメッセージを生成
- `GET /api/monthly-message/generate`: 生成状況をチェック
- `POST /api/monthly-message/generate`: 月次メッセージを生成（スケジューラー用）

### 3. フロントエンド
- `MonthlyMessage.tsx`: メッセージ表示コンポーネント
- 会社概要ページに統合

## 自動更新の実装オプション

### オプション1: Vercel Cron Jobs（推奨）
```javascript
// vercel.json に追加
{
  "crons": [
    {
      "path": "/api/monthly-message/generate",
      "schedule": "0 9 1 * *"
    }
  ]
}
```

### オプション2: GitHub Actions
```yaml
# .github/workflows/monthly-message.yml
name: Generate Monthly Message
on:
  schedule:
    - cron: '0 9 1 * *'  # 毎月1日 9:00 (JST 18:00)
  workflow_dispatch:

jobs:
  generate-message:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Monthly Message
        run: |
          curl -X POST https://your-domain.com/api/monthly-message/generate
```

### オプション3: 外部Cronサービス
- Easycron、cron-job.org等の外部サービスを利用
- URL: `https://your-domain.com/api/monthly-message/generate`
- スケジュール: `0 9 1 * *` (毎月1日 9:00)

## 実装手順

### 1. 環境変数の設定
```bash
# .env.local に追加
ANTHROPIC_API_KEY=your_claude_api_key_here
```

### 2. デプロイ設定
Vercel にデプロイ後、Cron Jobs を設定:
1. Vercel ダッシュボード → プロジェクト → Settings → Functions
2. Cron Jobs セクションで設定

### 3. 手動テスト
```bash
# メッセージ生成テスト
curl -X POST http://localhost:3000/api/monthly-message/generate

# メッセージ取得テスト
curl http://localhost:3000/api/monthly-message
```

## 動作フロー

1. **月初（毎月1日）**: 自動実行
2. **既存チェック**: 当月のメッセージが既に存在するかチェック
3. **アーカイブ**: 前月のメッセージを archived に更新
4. **データ取得**: 前月〜当月の日報データを取得（最新20件）
5. **AI生成**: Claude API でメッセージを生成
6. **保存**: データベースに新しいメッセージを保存
7. **表示**: フロントエンドで新しいメッセージを表示

## エラーハンドリング

1. **Claude API 失敗**: デフォルトメッセージを使用
2. **日報データなし**: デフォルトメッセージを使用
3. **データベースエラー**: ログに記録し、エラー画面を表示
4. **重複実行**: 既存メッセージがある場合はスキップ

## 監視・ログ

- Vercel Function Logs で実行状況を確認
- エラー発生時は Vercel 通知機能を活用
- 月次で手動確認し、必要に応じて手動実行

## セキュリティ

- Claude API キーは環境変数で管理
- RLS（Row Level Security）でデータアクセス制御
- API エンドポイントは適切なエラーハンドリング

## 今後の拡張可能性

- 管理画面からの手動生成・編集機能
- メッセージのプレビュー機能
- 複数の言語対応
- メール通知機能
- A/Bテスト機能