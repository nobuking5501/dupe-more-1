require('dotenv').config({ path: './admin-panel/.env.local' });
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

async function checkDateField() {
  console.log('🔍 日報の日付フィールド確認中...\n');

  const reportsSnapshot = await db.collection('daily_reports')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  console.log(`📖 最新10件の日報:\n`);

  reportsSnapshot.forEach((doc, index) => {
    const data = doc.data();

    console.log(`━━━ 日報 ${index + 1} ━━━`);
    console.log(`ID: ${doc.id}`);
    console.log('');
    console.log(`📅 reportDate (フォームで入力した日付):  ${data.reportDate}`);
    console.log(`🕐 createdAt  (システム登録日時):       ${data.createdAt?.toDate().toISOString()}`);
    console.log('');

    // 日付の比較
    const reportDate = new Date(data.reportDate);
    const createdDate = data.createdAt?.toDate();

    if (createdDate) {
      const reportDateStr = reportDate.toLocaleDateString('ja-JP');
      const createdDateStr = createdDate.toLocaleDateString('ja-JP');

      if (reportDateStr === createdDateStr) {
        console.log(`✅ 一致: 日報の日付と登録日が同じです`);
      } else {
        console.log(`⚠️ 不一致: 日報の日付(${reportDateStr}) ≠ 登録日(${createdDateStr})`);
        console.log(`   → これは過去の日報を後から入力したものです`);
      }
    }

    console.log(`スタッフ: ${data.staffName}`);
    console.log(`お客様: ${data.customerAttributes?.substring(0, 40) || 'なし'}...`);
    console.log('');
  });

  console.log('\n📊 結論:');
  console.log('・reportDate = フォームで入力した日付（日報の対象日）');
  console.log('・createdAt = システムが記録した登録日時');
  console.log('・この2つは別のフィールドです');
  console.log('・reportDateが正しく保存されていれば問題ありません\n');

  process.exit(0);
}

checkDateField().catch(err => {
  console.error('❌ エラー:', err);
  process.exit(1);
});
