const admin = require('firebase-admin');

// Firebase初期化
const serviceAccountPath = '/tmp/firebase-service-account.json';
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// 削除対象ID（check-duplicates.jsで特定したもの）
const TO_DELETE = [
  '1pOTaDxAxIX3unEUtVky',
  'hG32glf46o186IsX51TU',
  'PUqdOy66ff8iBywlhdyx',
  '9cFAn7aUbBX3QtpABU0z',
  'mDvx0NEJvcwUiYlyJND8',
  'naBp6n90AWYAMZ6SHqsj',
  'hrbZQyzcyyUXppiYphoc',
  'Yr38rh0949WzNEe3KdSP',
  'l32HhJMTI1KFDKXy9RQx',
  'PDZKCVjDFngnUw6wjfPz',
  'P1xhXkjMLb2CsQwL7NoE',
  'scwVuoa6TpCJj2pptdWJ',
  'pzU3QkqJ7jg5jSvxfGPY',
  'tIkZOCCt6aUcZuGJaaXb'
];

async function removeDuplicates() {
  try {
    console.log('🗑️  重複データを削除中...\n');
    console.log(`削除対象: ${TO_DELETE.length}件\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const id of TO_DELETE) {
      try {
        // IDで削除実行
        await db.collection('short_stories').doc(id).delete();
        console.log(`✅ 削除成功: ${id}`);
        successCount++;
      } catch (error) {
        console.error(`❌ 削除失敗: ${id}`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 結果:');
    console.log(`- 削除成功: ${successCount}件`);
    console.log(`- 削除失敗: ${errorCount}件`);

    // 削除後の確認
    console.log('\n🔍 削除後の状態を確認中...');
    const afterSnapshot = await db
      .collection('short_stories')
      .where('status', '==', 'active')
      .get();

    console.log(`削除後のactiveな小話: ${afterSnapshot.size}件`);

    if (afterSnapshot.size === 14) {
      console.log('\n✅ 重複削除完了！ユニークな小話が14件になりました');
    } else {
      console.log(`\n⚠️  警告: 予想と異なる件数です（期待値: 14件、実際: ${afterSnapshot.size}件）`);
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    process.exit(0);
  }
}

removeDuplicates();
