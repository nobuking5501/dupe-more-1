require('dotenv').config({ path: './.env.local' });
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

async function checkData() {
  console.log('🔍 Firebase データ確認中...\n');

  // 小話を確認
  console.log('📖 小話データ:');
  const storiesSnapshot = await db.collection('short_stories')
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(3)
    .get();

  console.log(`  件数: ${storiesSnapshot.size} 件`);
  storiesSnapshot.forEach((doc, index) => {
    const data = doc.data();
    console.log(`  ${index + 1}. ${data.title}`);
    console.log(`     作成日: ${data.createdAt?.toDate().toISOString().substring(0, 10)}`);
  });

  // ブログを確認
  console.log('\n📝 ブログデータ:');
  const blogsSnapshot = await db.collection('blog_posts')
    .where('status', '==', 'published')
    .orderBy('createdAt', 'desc')
    .limit(3)
    .get();

  console.log(`  件数: ${blogsSnapshot.size} 件`);
  blogsSnapshot.forEach((doc, index) => {
    const data = doc.data();
    console.log(`  ${index + 1}. ${data.title}`);
    console.log(`     作成日: ${data.createdAt?.toDate().toISOString().substring(0, 10)}`);
  });

  process.exit(0);
}

checkData().catch(err => {
  console.error('❌ エラー:', err);
  process.exit(1);
});
