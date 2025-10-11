# Firebase セットアップガイド

## 🔥 Firebase プロジェクト作成手順

### 1. Firebase Console でプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `dupe-and-more`）
4. Google Analytics は任意（後で有効化可能）
5. プロジェクト作成完了

### 2. Firestore Database 有効化

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. ロケーション選択: `asia-northeast1` (東京) または `asia-northeast2` (大阪)
4. セキュリティルール: **本番環境モード**を選択（後で設定）
5. 「有効にする」をクリック

### 3. Webアプリの登録（クライアント側設定）

1. プロジェクト設定 ⚙️ → 「全般」タブ
2. 「アプリを追加」→ Webアイコン `</>` をクリック
3. アプリのニックネーム: `dupe-more-public` (メインサイト用)
4. Firebase Hosting は今回不要（チェック外す）
5. 「アプリを登録」をクリック

表示される設定値を以下の環境変数に設定:

```bash
# クライアント側環境変数（公開可能）
NEXT_PUBLIC_FIREBASE_API_KEY=<apiKey>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<authDomain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storageBucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
NEXT_PUBLIC_FIREBASE_APP_ID=<appId>
```

### 4. サービスアカウントキー取得（サーバー側設定）

1. プロジェクト設定 ⚙️ → 「サービスアカウント」タブ
2. 「新しい秘密鍵を生成」ボタンをクリック
3. JSON ファイルがダウンロードされる
4. このファイルを**安全に保管**（Gitにコミットしない！）

#### 方法A: JSON全体を環境変数に設定（簡単）

ダウンロードしたJSONファイルの内容を1行にして設定:

```bash
# サーバー側環境変数（絶対に公開しない！）
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

#### 方法B: 個別の環境変数に設定（推奨・安全）

```bash
# サーバー側環境変数（絶対に公開しない！）
FIREBASE_PROJECT_ID=<project_id>
FIREBASE_CLIENT_EMAIL=<client_email>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**注意:** `FIREBASE_PRIVATE_KEY` は改行を `\n` でエスケープしてください。

---

## 📝 環境変数設定ファイル

### メインサイト: `.env.local`

```bash
# ========================================
# Firebase設定（クライアント側）
# ========================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ========================================
# Firebase Admin設定（サーバー側）
# ========================================
# 方法A: JSON全体
# FIREBASE_SERVICE_ACCOUNT_KEY='...'

# 方法B: 個別設定（推奨）
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# ========================================
# 既存の設定（Claudeなど）
# ========================================
ANTHROPIC_API_KEY=<your-anthropic-api-key>
NEXTAUTH_URL=http://localhost:3000
REVALIDATE_SECRET=dupe-and-more-revalidate-secret-2025
```

### 管理画面: `admin-panel/.env.local`

```bash
# ========================================
# Firebase設定（クライアント側）
# ========================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ========================================
# Firebase Admin設定（サーバー側）
# ========================================
# 方法A: JSON全体
# FIREBASE_SERVICE_ACCOUNT_KEY='...'

# 方法B: 個別設定（推奨）
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# ========================================
# 既存の設定
# ========================================
ANTHROPIC_API_KEY=<your-anthropic-api-key>
NEXTAUTH_URL=http://localhost:3002
PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=dupe-and-more-revalidate-secret-2025
```

---

## 🔐 セキュリティルール設定

Firestore Database → ルール タブで以下を設定:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 日報: 管理者のみ読み書き可能
    match /daily_reports/{reportId} {
      allow read, write: if false; // APIからのみアクセス
    }

    // 小話: 公開読み取り可能、書き込みは管理者のみ
    match /short_stories/{storyId} {
      allow read: if true; // 一般公開
      allow write: if false; // APIからのみアクセス
    }

    // ブログ: 公開読み取り可能、書き込みは管理者のみ
    match /blog_posts/{postId} {
      allow read: if resource.data.status == 'published'; // 公開済みのみ
      allow write: if false; // APIからのみアクセス
    }

    // その他のコレクション
    match /owner_messages/{messageId} {
      allow read: if resource.data.status == 'published';
      allow write: if false;
    }

    match /shorts/{shortId} {
      allow read: if resource.data.status == 'published';
      allow write: if false;
    }

    match /monthly_messages/{messageId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

**注意:** `allow write: if false` により、クライアント側から直接書き込みできません。
すべての書き込みはFirebase Admin SDK（サーバーサイドAPI）経由で行います。

---

## ✅ セットアップ確認手順

### 1. 環境変数が正しく設定されているか確認

```bash
# メインサイト
cd /mnt/c/Users/user/Desktop/dupe＆more-1
cat .env.local | grep FIREBASE

# 管理画面
cd admin-panel
cat .env.local | grep FIREBASE
```

### 2. 開発サーバー起動

```bash
# メインサイト
npm run dev:public

# 管理画面（別ターミナル）
npm run dev:admin
```

### 3. Firebase接続テスト

ブラウザで以下のURLにアクセス:
- http://localhost:3002/api/health (管理画面ヘルスチェック)

コンソールログにFirebase接続成功メッセージが表示されればOK。

---

## 🚨 トラブルシューティング

### エラー: "Firebase Admin: 環境変数が設定されていません"

→ `.env.local` に `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` が設定されているか確認

### エラー: "PERMISSION_DENIED"

→ Firestoreのセキュリティルールが厳しすぎる可能性があります。開発中は一時的に緩めることも可能です。

### サービスアカウントキーのJSONエラー

→ JSONを1行にする際、シングルクォート `'` で囲んでください。ダブルクォートの場合はエスケープが必要です。

---

## 📚 次のステップ

1. ✅ Firebase設定完了
2. 🔄 Firestoreデータモデル設計
3. 📊 Supabaseからデータ移行
4. 💻 APIルートの書き換え
5. 🧪 動作テスト
6. 🚀 本番デプロイ

---

**作成日:** 2025-10-11
**対象プロジェクト:** Dupe&more (障害者専門脱毛サロン)
