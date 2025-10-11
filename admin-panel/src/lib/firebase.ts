import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

// Firebase configuration (管理画面用)
// これらの値はFirebase Consoleから取得してください:
// https://console.firebase.google.com/ → プロジェクト設定 → 全般 → アプリの設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Firebaseアプリの初期化（シングルトンパターン）
let app: FirebaseApp
let db: Firestore

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
} else {
  app = getApps()[0]
  db = getFirestore(app)
}

export { app, db }
export default db
