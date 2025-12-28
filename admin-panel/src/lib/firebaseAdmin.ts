import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

// Firebase Admin SDK設定（管理画面サーバーサイド専用）
let adminApp: App
let adminDb: Firestore

// 既存のアプリがなければ初期化
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  // \nエスケープシーケンスを実際の改行に変換
  // 既に改行が入っている場合はそのまま使用
  let privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (privateKey) {
    // \n（バックスラッシュ+n）を改行に変換
    privateKey = privateKey.replace(/\\n/g, '\n')
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin: 環境変数が設定されていません。' +
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY を設定してください。'
    )
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })

  adminDb = getFirestore(adminApp)
} else {
  adminApp = getApps()[0]
  adminDb = getFirestore(adminApp)
}

export { adminApp, adminDb }
export default adminDb
