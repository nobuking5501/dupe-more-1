# Vercelデプロイ手順

## プロジェクト構成
このリポジトリには2つのNext.jsアプリケーションが含まれています：

1. **メインサイト** (`public-site/`) → Vercelプロジェクト名: `dupe-more-1`
2. **管理画面** (`admin-panel/`) → Vercelプロジェクト名: `dupe-more-admin`

## デプロイ手順

### 1. メインサイト（dupe-more-1）のデプロイ

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリ `nobuking5501/dupe-more-1` を選択
3. プロジェクト設定：
   - **Project Name**: `dupe-more-1`
   - **Framework Preset**: Next.js
   - **Root Directory**: `public-site`
   - **Build Command**: `npm run build` (デフォルト)
   - **Output Directory**: `.next` (デフォルト)
   - **Install Command**: `npm install` (デフォルト)

4. 環境変数を設定：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://yaogagvttkpoapkwdrjd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhb2dhZ3Z0dGtwb2Fwa3dkcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTQ2NzQsImV4cCI6MjA2OTg5MDY3NH0.sRSDHAq3XqDP7AmumBJ52RyWXNIzNPBFFHR01bxHjjY
   ```

### 2. 管理画面（dupe-more-admin）のデプロイ

1. Vercelダッシュボードで「New Project」をクリック
2. 同じGitHubリポジトリ `nobuking5501/dupe-more-1` を選択
3. プロジェクト設定：
   - **Project Name**: `dupe-more-admin`
   - **Framework Preset**: Next.js
   - **Root Directory**: `admin-panel`
   - **Build Command**: `npm run build` (デフォルト)
   - **Output Directory**: `.next` (デフォルト)
   - **Install Command**: `npm install` (デフォルト)

4. 環境変数を設定：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://yaogagvttkpoapkwdrjd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhb2dhZ3Z0dGtwb2Fwa3dkcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTQ2NzQsImV4cCI6MjA2OTg5MDY3NH0.sRSDHAq3XqDP7AmumBJ52RyWXNIzNPBFFHR01bxHjjY
   SUPABASE_SERVICE_ROLE_KEY=[Supabaseダッシュボードから取得]
   ANTHROPIC_API_KEY=[Claude APIキー]
   NEXTAUTH_SECRET=[任意のランダム文字列]
   NEXTAUTH_URL=https://dupe-more-admin.vercel.app
   ```

## 注意事項

- 両プロジェクトとも同じGitHubリポジトリを使用しますが、Root Directoryが異なります
- 環境変数は各プロジェクトで個別に設定する必要があります
- `NEXTAUTH_URL`は管理画面のVercel URLに合わせて設定してください
- デプロイ後、ドメインが確定したら適宜URLを更新してください

## データベース設定

デプロイ前にSupabaseで以下のSQLを実行してください：
```sql
-- database-setup.sqlの内容を実行
```

## 動作確認

1. メインサイト: https://dupe-more-1.vercel.app
2. 管理画面: https://dupe-more-admin.vercel.app
3. オーナーメッセージ機能のテスト
4. Supabase接続の確認