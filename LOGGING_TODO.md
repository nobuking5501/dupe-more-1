# ログ取得改善タスク

## 次回実装予定のログ機能

### 1. サーバーサイドログの強化
- API エンドポイントでの詳細ログ追加
- エラーハンドリングでのスタックトレース出力
- Supabase接続状況のログ
- Claude API呼び出し結果のログ

### 2. クライアントサイドログ
- ユーザーアクション追跡
- エラー境界でのエラーキャッチ
- パフォーマンス計測ログ

### 3. Vercelログ設定
- Function logs の有効化
- Edge Runtime logs の確認
- Build logs の詳細出力

### 4. 外部ログサービス連携（検討）
- Vercel Analytics
- LogRocket や Sentry などの検討

### 5. 開発環境でのログ確認手順
- ローカル開発時のログ出力確認
- ブラウザ開発者ツールでの確認方法
- Vercel CLI を使ったリアルタイムログ確認

## 実装優先度
1. 🔴 API エンドポイントのエラーログ強化
2. 🟡 Supabase接続ログの詳細化  
3. 🟢 パフォーマンス計測ログ
4. 🔵 外部ログサービス連携

## 確認すべき箇所
- `/api/owner-message/generate` でのClaude API エラー
- `/api/owner-message/list` でのSupabase接続エラー
- フロントエンドでのデータフェッチエラー