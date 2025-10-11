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

async function checkShortStories() {
  try {
    console.log('📊 小話データを調査中...\n');

    // 全小話を取得
    const allStoriesSnapshot = await db.collection('short_stories').get();
    console.log(`全小話数: ${allStoriesSnapshot.size}件`);

    // status == 'active'の小話を取得
    const activeStoriesSnapshot = await db
      .collection('short_stories')
      .where('status', '==', 'active')
      .get();
    console.log(`status=='active'の小話数: ${activeStoriesSnapshot.size}件\n`);

    // 詳細情報を表示
    console.log('📝 各小話の詳細:');
    console.log('─'.repeat(80));

    const stories = [];
    activeStoriesSnapshot.forEach(doc => {
      const data = doc.data();
      stories.push({
        id: doc.id,
        title: data.title,
        status: data.status,
        isFeatured: data.isFeatured,
        createdAt: data.createdAt?.toDate(),
        reportDate: data.reportDate
      });
    });

    // createdAtでソート
    stories.sort((a, b) => {
      if (b.isFeatured !== a.isFeatured) {
        return b.isFeatured ? 1 : -1;
      }
      return b.createdAt - a.createdAt;
    });

    stories.forEach((story, index) => {
      console.log(`${index + 1}. ID: ${story.id}`);
      console.log(`   タイトル: ${story.title}`);
      console.log(`   status: ${story.status}`);
      console.log(`   isFeatured: ${story.isFeatured}`);
      console.log(`   作成日: ${story.createdAt?.toISOString()}`);
      console.log(`   レポート日: ${story.reportDate}`);
      console.log('─'.repeat(80));
    });

    console.log(`\n🔍 結論:`);
    console.log(`- Firestore内のactiveな小話: ${activeStoriesSnapshot.size}件`);
    console.log(`- admin-shorts APIが返す件数: 5件（.slice(0, 5)により制限）`);

    if (activeStoriesSnapshot.size > 5) {
      console.log(`\n⚠️  警告: ${activeStoriesSnapshot.size - 5}件の小話が表示されていません`);
      console.log(`対処: admin-shorts/route.tsの.slice(0, 5)を削除または変更してください`);
    } else if (activeStoriesSnapshot.size < 5) {
      console.log(`\n✅ OK: 全ての小話が表示されています（${activeStoriesSnapshot.size}件）`);
    } else {
      console.log(`\n✅ OK: ちょうど5件の小話があります`);
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    process.exit(0);
  }
}

checkShortStories();
