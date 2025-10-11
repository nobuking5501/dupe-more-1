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

async function checkAllDates() {
  console.log('🔍 全日報の日付を確認中...\n');

  // reportDateでソート
  const reportsSnapshot = await db.collection('daily_reports')
    .orderBy('reportDate', 'desc')
    .get();

  console.log(`📖 全日報データ: ${reportsSnapshot.size} 件\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const dateGroups = {};

  reportsSnapshot.forEach((doc) => {
    const data = doc.data();
    const reportDate = data.reportDate;

    if (!dateGroups[reportDate]) {
      dateGroups[reportDate] = [];
    }

    dateGroups[reportDate].push({
      id: doc.id.substring(0, 8),
      customer: data.customerAttributes?.substring(0, 40) || 'なし',
      createdAt: data.createdAt?.toDate().toISOString().substring(0, 19)
    });
  });

  // 日付ごとに表示
  const sortedDates = Object.keys(dateGroups).sort().reverse();

  sortedDates.forEach((date) => {
    const reports = dateGroups[date];
    const count = reports.length;

    console.log(`📅 ${date} (${count}件)${count > 1 ? ' ⚠️ 重複あり' : ''}`);

    reports.forEach((report, index) => {
      console.log(`   ${index + 1}. ID: ${report.id}... | ${report.customer}`);
      console.log(`      登録日時: ${report.createdAt}`);
    });
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // サマリー
  console.log('📊 サマリー:');
  console.log(`   全日報件数: ${reportsSnapshot.size} 件`);
  console.log(`   異なる日付: ${sortedDates.length} 日分`);

  const duplicates = sortedDates.filter(date => dateGroups[date].length > 1);
  if (duplicates.length > 0) {
    console.log(`   重複のある日付: ${duplicates.length} 日`);
    console.log(`\n   重複している日付:`);
    duplicates.forEach(date => {
      console.log(`   - ${date}: ${dateGroups[date].length} 件`);
    });
  } else {
    console.log(`   ✅ 重複なし`);
  }

  process.exit(0);
}

checkAllDates().catch(err => {
  console.error('❌ エラー:', err);
  process.exit(1);
});
