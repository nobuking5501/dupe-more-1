#!/usr/bin/env node
/**
 * Supabase → Firebase データ移行スクリプト (JavaScript版)
 *
 * 実行方法:
 * node scripts/migrate-to-firebase.js
 */

const { createClient } = require('@supabase/supabase-js')
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')
const dotenv = require('dotenv')
const path = require('path')

// 環境変数読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('='.repeat(60))
console.log('🔥 Supabase → Firebase データ移行スクリプト')
console.log('='.repeat(60))

// Supabase クライアント初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Supabaseクライアント初期化完了')

// Firebase Admin SDK初期化
const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Firebase環境変数が設定されていません')
  console.error('必要な環境変数: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY')
  process.exit(1)
}

const app = initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
})

const db = getFirestore(app)
console.log('✅ Firebase Admin SDK初期化完了')

// スネークケース → キャメルケース変換
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// オブジェクトのキーをキャメルケースに変換
function convertKeysToCamelCase(obj) {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(convertKeysToCamelCase)
  if (typeof obj !== 'object') return obj

  const converted = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key)
    converted[camelKey] = convertKeysToCamelCase(value)
  }
  return converted
}

// 日報データの移行
async function migrateDailyReports() {
  console.log('\n📋 日報データを移行中...')

  const { data: reports, error } = await supabase
    .from('daily_reports')
    .select('*')
    .order('report_date', { ascending: false })

  if (error) {
    console.error('❌ 日報データ取得エラー:', error.message)
    return
  }

  if (!reports || reports.length === 0) {
    console.log('⚠️  日報データが見つかりません')
    return
  }

  console.log(`📊 ${reports.length}件の日報を移行します`)

  const batch = db.batch()
  let count = 0

  for (const report of reports) {
    const docRef = db.collection('daily_reports').doc()
    const firestoreData = convertKeysToCamelCase(report)

    // タイムスタンプを変換
    if (firestoreData.createdAt) {
      firestoreData.createdAt = Timestamp.fromDate(new Date(firestoreData.createdAt))
    }
    if (firestoreData.updatedAt) {
      firestoreData.updatedAt = Timestamp.fromDate(new Date(firestoreData.updatedAt))
    }

    delete firestoreData.id

    batch.set(docRef, firestoreData)
    count++

    if (count % 500 === 0) {
      await batch.commit()
      console.log(`  ✓ ${count}件コミット済み`)
    }
  }

  if (count % 500 !== 0) {
    await batch.commit()
  }

  console.log(`✅ 日報データ移行完了: ${count}件`)
}

// 小話データの移行
async function migrateShortStories() {
  console.log('\n📖 小話データを移行中...')

  const { data: stories, error } = await supabase
    .from('short_stories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ 小話データ取得エラー:', error.message)
    return
  }

  if (!stories || stories.length === 0) {
    console.log('⚠️  小話データが見つかりません')
    return
  }

  console.log(`📊 ${stories.length}件の小話を移行します`)

  const batch = db.batch()
  let count = 0

  for (const story of stories) {
    const docRef = db.collection('short_stories').doc()
    const firestoreData = convertKeysToCamelCase(story)

    if (firestoreData.createdAt) {
      firestoreData.createdAt = Timestamp.fromDate(new Date(firestoreData.createdAt))
    }
    if (firestoreData.updatedAt) {
      firestoreData.updatedAt = Timestamp.fromDate(new Date(firestoreData.updatedAt))
    }

    delete firestoreData.id

    batch.set(docRef, firestoreData)
    count++

    if (count % 500 === 0) {
      await batch.commit()
      console.log(`  ✓ ${count}件コミット済み`)
    }
  }

  if (count % 500 !== 0) {
    await batch.commit()
  }

  console.log(`✅ 小話データ移行完了: ${count}件`)
}

// ブログ記事データの移行
async function migrateBlogPosts() {
  console.log('\n📝 ブログ記事データを移行中...')

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ ブログ記事データ取得エラー:', error.message)
    return
  }

  if (!posts || posts.length === 0) {
    console.log('⚠️  ブログ記事データが見つかりません')
    return
  }

  console.log(`📊 ${posts.length}件のブログ記事を移行します`)

  const batch = db.batch()
  let count = 0

  for (const post of posts) {
    const docRef = db.collection('blog_posts').doc()
    const firestoreData = convertKeysToCamelCase(post)

    if (firestoreData.createdAt) {
      firestoreData.createdAt = Timestamp.fromDate(new Date(firestoreData.createdAt))
    }
    if (firestoreData.updatedAt) {
      firestoreData.updatedAt = Timestamp.fromDate(new Date(firestoreData.updatedAt))
    }
    if (firestoreData.publishedAt) {
      firestoreData.publishedAt = Timestamp.fromDate(new Date(firestoreData.publishedAt))
    }

    delete firestoreData.id

    batch.set(docRef, firestoreData)
    count++

    if (count % 500 === 0) {
      await batch.commit()
      console.log(`  ✓ ${count}件コミット済み`)
    }
  }

  if (count % 500 !== 0) {
    await batch.commit()
  }

  console.log(`✅ ブログ記事データ移行完了: ${count}件`)
}

// Shortsデータの移行
async function migrateShorts() {
  console.log('\n📰 Shortsデータを移行中...')

  const { data: shorts, error } = await supabase
    .from('shorts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Shortsデータ取得エラー:', error.message)
    return
  }

  if (!shorts || shorts.length === 0) {
    console.log('⚠️  Shortsデータが見つかりません')
    return
  }

  console.log(`📊 ${shorts.length}件のShortsを移行します`)

  const batch = db.batch()
  let count = 0

  for (const short of shorts) {
    const docRef = db.collection('shorts').doc()
    const firestoreData = convertKeysToCamelCase(short)

    if (firestoreData.createdAt) {
      firestoreData.createdAt = Timestamp.fromDate(new Date(firestoreData.createdAt))
    }
    if (firestoreData.updatedAt) {
      firestoreData.updatedAt = Timestamp.fromDate(new Date(firestoreData.updatedAt))
    }
    if (firestoreData.publishedAt) {
      firestoreData.publishedAt = Timestamp.fromDate(new Date(firestoreData.publishedAt))
    }

    delete firestoreData.id

    batch.set(docRef, firestoreData)
    count++

    if (count % 500 === 0) {
      await batch.commit()
      console.log(`  ✓ ${count}件コミット済み`)
    }
  }

  if (count % 500 !== 0) {
    await batch.commit()
  }

  console.log(`✅ Shortsデータ移行完了: ${count}件`)
}

// 月次メッセージデータの移行
async function migrateMonthlyMessages() {
  console.log('\n📅 月次メッセージデータを移行中...')

  const { data: messages, error } = await supabase
    .from('monthly_messages')
    .select('*')
    .order('year_month', { ascending: false })

  if (error) {
    console.error('❌ 月次メッセージデータ取得エラー:', error.message)
    return
  }

  if (!messages || messages.length === 0) {
    console.log('⚠️  月次メッセージデータが見つかりません')
    return
  }

  console.log(`📊 ${messages.length}件の月次メッセージを移行します`)

  const batch = db.batch()
  let count = 0

  for (const message of messages) {
    const docRef = db.collection('monthly_messages').doc()
    const firestoreData = convertKeysToCamelCase(message)

    if (firestoreData.generatedAt) {
      firestoreData.generatedAt = Timestamp.fromDate(new Date(firestoreData.generatedAt))
    }

    delete firestoreData.id

    batch.set(docRef, firestoreData)
    count++

    if (count % 500 === 0) {
      await batch.commit()
      console.log(`  ✓ ${count}件コミット済み`)
    }
  }

  if (count % 500 !== 0) {
    await batch.commit()
  }

  console.log(`✅ 月次メッセージデータ移行完了: ${count}件`)
}

// メイン処理
async function main() {
  try {
    console.log('\n🚀 データ移行を開始します...\n')

    await migrateDailyReports()
    await migrateShortStories()
    await migrateBlogPosts()
    await migrateShorts()
    await migrateMonthlyMessages()

    console.log('\n' + '='.repeat(60))
    console.log('🎉 すべてのデータ移行が完了しました！')
    console.log('='.repeat(60))

    process.exit(0)
  } catch (error) {
    console.error('\n❌ 移行中にエラーが発生しました:', error)
    process.exit(1)
  }
}

main()
