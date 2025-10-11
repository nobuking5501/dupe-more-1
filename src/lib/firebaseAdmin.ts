import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

// Firebase Admin SDK設定（サーバーサイド専用）
// サービスアカウントキーの取得方法:
// 1. Firebase Console → プロジェクト設定 → サービスアカウント
// 2. 「新しい秘密鍵を生成」ボタンをクリック
// 3. ダウンロードしたJSONファイルの内容を環境変数に設定

let adminApp: App
let adminDb: Firestore

// 既存のアプリがなければ初期化
if (!getApps().length) {
  // 方法1: サービスアカウントキーをJSON形式で環境変数に設定
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined

  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    })
  } else {
    // 方法2: 個別の環境変数で設定（より安全）
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (projectId && clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    } else {
      throw new Error(
        'Firebase Admin: 環境変数が設定されていません。' +
        'FIREBASE_SERVICE_ACCOUNT_KEY または ' +
        '(FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) を設定してください。'
      )
    }
  }

  adminDb = getFirestore(adminApp)
} else {
  adminApp = getApps()[0]
  adminDb = getFirestore(adminApp)
}

export { adminApp, adminDb }
export default adminDb
