import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

console.log('=== 管理画面 Firebase設定確認 ===')

export async function GET() {
  try {
    console.log('=== データベーステスト開始 ===')

    const tests = []

    // 1. daily_reports コレクション存在確認
    try {
      const reportsSnapshot = await adminDb
        .collection('daily_reports')
        .limit(1)
        .get()

      tests.push({
        test: 'daily_reports コレクション',
        status: '正常',
        error: null
      })
    } catch (e) {
      tests.push({
        test: 'daily_reports コレクション',
        status: 'エラー',
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // 2. short_stories コレクション存在確認
    try {
      const storiesSnapshot = await adminDb
        .collection('short_stories')
        .limit(1)
        .get()

      tests.push({
        test: 'short_stories コレクション',
        status: '正常',
        error: null
      })
    } catch (e) {
      tests.push({
        test: 'short_stories コレクション',
        status: 'エラー',
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // 3. サンプルデータ確認
    try {
      const reportsSnapshot = await adminDb
        .collection('daily_reports')
        .limit(5)
        .get()

      tests.push({
        test: 'daily_reports データ',
        status: '正常',
        count: reportsSnapshot.size,
        error: null
      })
    } catch (e) {
      tests.push({
        test: 'daily_reports データ',
        status: 'エラー',
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // 4. 小話データ確認
    try {
      const storiesSnapshot = await adminDb
        .collection('short_stories')
        .limit(5)
        .get()

      tests.push({
        test: 'short_stories データ',
        status: '正常',
        count: storiesSnapshot.size,
        error: null
      })
    } catch (e) {
      tests.push({
        test: 'short_stories データ',
        status: 'エラー',
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // 5. blog_posts コレクション確認
    try {
      const postsSnapshot = await adminDb
        .collection('blog_posts')
        .limit(5)
        .get()

      tests.push({
        test: 'blog_posts データ',
        status: '正常',
        count: postsSnapshot.size,
        error: null
      })
    } catch (e) {
      tests.push({
        test: 'blog_posts データ',
        status: 'エラー',
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    console.log('=== テスト結果 ===')
    tests.forEach(test => {
      console.log(`${test.test}: ${test.status}`)
      if (test.error) console.log(`  エラー: ${test.error}`)
      if (test.count !== undefined) console.log(`  データ件数: ${test.count}`)
    })

    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

    return NextResponse.json({
      message: 'データベーステスト完了',
      tests: tests,
      environment: {
        firebaseProjectId: projectId ? `${projectId}` : 'なし',
        firebaseClientEmail: clientEmail ? `${clientEmail.substring(0, 30)}...` : 'なし'
      }
    })

  } catch (error) {
    console.error('テストエラー:', error)
    return NextResponse.json(
      { error: `テスト実行エラー: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
