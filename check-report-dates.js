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

async function checkReportDates() {
  console.log('🔍 日報データの日付確認中...\n');

  // すべての日報を取得
  const reportsSnapshot = await db.collection('daily_reports').orderBy('reportDate', 'desc').limit(15).get();

  console.log(`📖 日報データ: ${reportsSnapshot.size} 件（最新15件）\n`);

  reportsSnapshot.forEach((doc, index) => {
    const data = doc.data();
    console.log(`--- 日報 ${index + 1} ---`);
    console.log(`ID: ${doc.id}`);
    console.log(`reportDate (日報の日付): ${data.reportDate}`);
    console.log(`createdAt (登録日時): ${data.createdAt?.toDate().toISOString()}`);
    console.log(`staffName: ${data.staffName}`);
    console.log(`customerAttributes: ${data.customerAttributes?.substring(0, 50) || 'なし'}...`);
    console.log('');
  });

  // 日付の重複チェック
  console.log('\n📅 日付の重複チェック...\n');
  const dates = {};
  reportsSnapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.reportDate;
    if (!dates[date]) {
      dates[date] = [];
    }
    dates[date].push(doc.id);
  });

  let hasDuplicates = false;
  Object.entries(dates).forEach(([date, ids]) => {
    if (ids.length > 1) {
      console.log(`⚠️ 重複: ${date} に ${ids.length} 件の日報があります`);
      console.log(`   ID: ${ids.join(', ')}`);
      hasDuplicates = true;
    }
  });

  if (!hasDuplicates) {
    console.log('✅ 日付の重複はありません');
  }

  process.exit(0);
}

checkReportDates().catch(err => {
  console.error('❌ エラー:', err);
  process.exit(1);
});
