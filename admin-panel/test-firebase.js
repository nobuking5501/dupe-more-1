#!/usr/bin/env node
/**
 * Firebase接続テストスクリプト
 */

const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const dotenv = require('dotenv')
const path = require('path')

// 環境変数読み込み
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

console.log('='.repeat(60))
console.log('🔥 Firebase接続テスト')
console.log('='.repeat(60))

async function testFirebaseConnection() {
  try {
    // Firebase Admin SDK初期化
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    console.log('\n📝 環境変数チェック:')
    console.log('  FIREBASE_PROJECT_ID:', projectId ? '✅' : '❌')
    console.log('  FIREBASE_CLIENT_EMAIL:', clientEmail ? '✅' : '❌')
    console.log('  FIREBASE_PRIVATE_KEY:', privateKey ? '✅' : '❌')

    if (!projectId || !clientEmail || !privateKey) {
      console.error('\n❌ Firebase環境変数が設定されていません')
      process.exit(1)
    }

    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })

    console.log('\n✅ Firebase Admin SDK初期化完了')

    const db = getFirestore(app)
    console.log('✅ Firestore接続確立')

    // daily_reportsコレクションのデータ件数を取得
    console.log('\n📊 データ確認:')

    const reportsSnapshot = await db.collection('daily_reports').limit(5).get()
    console.log(`  daily_reports: ${reportsSnapshot.size}件（最初の5件）`)

    const storiesSnapshot = await db.collection('short_stories').limit(5).get()
    console.log(`  short_stories: ${storiesSnapshot.size}件（最初の5件）`)

    const postsSnapshot = await db.collection('blog_posts').limit(5).get()
    console.log(`  blog_posts: ${postsSnapshot.size}件（最初の5件）`)

    // サンプルデータを1件取得して表示
    if (!reportsSnapshot.empty) {
      const firstReport = reportsSnapshot.docs[0]
      console.log('\n📄 サンプル日報データ:')
      console.log(`  ID: ${firstReport.id}`)
      console.log(`  日付: ${firstReport.data().reportDate}`)
      console.log(`  スタッフ: ${firstReport.data().staffName}`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Firebase接続テスト成功！')
    console.log('='.repeat(60))

    process.exit(0)
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testFirebaseConnection()
