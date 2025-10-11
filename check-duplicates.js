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

async function checkDuplicates() {
  try {
    console.log('🔍 重複データを調査中...\n');

    const storiesSnapshot = await db
      .collection('short_stories')
      .where('status', '==', 'active')
      .get();

    const stories = [];
    storiesSnapshot.forEach(doc => {
      const data = doc.data();
      stories.push({
        id: doc.id,
        title: data.title,
        reportDate: data.reportDate,
        createdAt: data.createdAt?.toDate(),
        content: data.content
      });
    });

    // title + reportDateで重複をグループ化
    const grouped = {};
    stories.forEach(story => {
      const key = `${story.title}_${story.reportDate}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(story);
    });

    // 重複があるもののみ表示
    const duplicates = Object.entries(grouped).filter(([key, items]) => items.length > 1);

    console.log(`📊 統計:`);
    console.log(`- 全小話数: ${stories.length}件`);
    console.log(`- ユニーク小話数: ${Object.keys(grouped).length}件`);
    console.log(`- 重複グループ数: ${duplicates.length}グループ`);
    console.log(`- 余分なレコード数: ${stories.length - Object.keys(grouped).length}件\n`);

    if (duplicates.length > 0) {
      console.log('⚠️  重複している小話:\n');
      duplicates.forEach(([key, items], index) => {
        console.log(`${index + 1}. タイトル: ${items[0].title}`);
        console.log(`   レポート日: ${items[0].reportDate}`);
        console.log(`   重複数: ${items.length}件`);
        items.forEach((item, i) => {
          console.log(`   - [${i + 1}] ID: ${item.id}, 作成日: ${item.createdAt?.toISOString()}`);
        });
        console.log('');
      });

      console.log('🔧 重複削除スクリプトを生成中...\n');

      // 各グループの最も古いレコードを残し、他を削除するIDリストを作成
      const toDelete = [];
      duplicates.forEach(([key, items]) => {
        // 作成日でソート（古い順）
        items.sort((a, b) => a.createdAt - b.createdAt);
        // 最初（最も古い）以外を削除対象に
        for (let i = 1; i < items.length; i++) {
          toDelete.push(items[i].id);
        }
      });

      console.log(`削除対象ID（${toDelete.length}件）:`);
      toDelete.forEach(id => console.log(`  - ${id}`));

      console.log('\n💡 削除を実行するには:');
      console.log('   node remove-duplicates.js');
    } else {
      console.log('✅ 重複データはありません');
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    process.exit(0);
  }
}

checkDuplicates();
