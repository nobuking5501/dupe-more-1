require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const db = admin.firestore();

async function checkShortStoriesDetail() {
  console.log('🔍 小話データの詳細確認中...\n');

  // すべての小話を取得
  const storiesSnapshot = await db.collection('short_stories').orderBy('createdAt', 'desc').limit(10).get();

  console.log(`📖 小話データ: ${storiesSnapshot.size} 件（最新10件）\n`);

  storiesSnapshot.forEach((doc, index) => {
    const data = doc.data();
    console.log(`--- 小話 ${index + 1} ---`);
    console.log(`ID: ${doc.id}`);
    console.log(`タイトル: ${data.title}`);
    console.log(`status: ${data.status}`);
    console.log(`isFeatured: ${data.isFeatured}`);
    console.log(`reportDate: ${data.reportDate}`);
    console.log(`content: ${data.content?.substring(0, 100)}...`);
    console.log(`createdAt: ${data.createdAt?.toDate().toISOString()}`);
    console.log('');
  });

  // status='active' AND isFeatured=true のクエリを実行
  console.log('\n🔍 フィーチャー小話のクエリ実行中...');
  console.log('クエリ: status==active AND isFeatured==true\n');

  try {
    const featuredSnapshot = await db
      .collection('short_stories')
      .where('status', '==', 'active')
      .where('isFeatured', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (featuredSnapshot.empty) {
      console.log('❌ フィーチャー小話が見つかりません');
      console.log('原因: status="active" かつ isFeatured=true のデータが存在しない');
    } else {
      const doc = featuredSnapshot.docs[0];
      const data = doc.data();
      console.log('✅ フィーチャー小話が見つかりました:');
      console.log(`ID: ${doc.id}`);
      console.log(`タイトル: ${data.title}`);
      console.log(`content: ${data.content?.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error('❌ クエリエラー:', error.message);
    if (error.message.includes('index')) {
      console.log('\n💡 解決方法: Firestoreコンソールでインデックスを作成してください');
    }
  }

  process.exit(0);
}

checkShortStoriesDetail().catch(err => {
  console.error('❌ エラー:', err);
  process.exit(1);
});
