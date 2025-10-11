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

async function removeDuplicateReports() {
  console.log('🔍 重複日報の削除開始...\n');

  // すべての日報を取得
  const reportsSnapshot = await db.collection('daily_reports').get();

  console.log(`📖 全日報データ: ${reportsSnapshot.size} 件\n`);

  // 日付ごとにグループ化
  const reportsByDate = {};
  reportsSnapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.reportDate;
    if (!reportsByDate[date]) {
      reportsByDate[date] = [];
    }
    reportsByDate[date].push({
      id: doc.id,
      createdAt: data.createdAt,
      data: data
    });
  });

  console.log('📅 日付ごとの日報数:\n');
  Object.entries(reportsByDate).forEach(([date, reports]) => {
    console.log(`  ${date}: ${reports.length} 件`);
  });

  // 各日付について、最新の1件を残して他を削除
  console.log('\n🗑️  重複削除中...\n');

  let deletedCount = 0;
  let keptCount = 0;

  for (const [date, reports] of Object.entries(reportsByDate)) {
    if (reports.length > 1) {
      // createdAtで降順ソート（最新が先頭）
      reports.sort((a, b) => {
        const timeA = a.createdAt?.toDate().getTime() || 0;
        const timeB = b.createdAt?.toDate().getTime() || 0;
        return timeB - timeA;
      });

      // 最初の1件を残す
      const keep = reports[0];
      console.log(`📅 ${date}:`);
      console.log(`  ✅ 残す: ${keep.id} (登録: ${keep.createdAt?.toDate().toISOString()})`);
      keptCount++;

      // 残りを削除
      for (let i = 1; i < reports.length; i++) {
        const toDelete = reports[i];
        console.log(`  ❌ 削除: ${toDelete.id} (登録: ${toDelete.createdAt?.toDate().toISOString()})`);
        await db.collection('daily_reports').doc(toDelete.id).delete();
        deletedCount++;
      }
      console.log('');
    } else {
      keptCount++;
    }
  }

  console.log('\n✅ 重複削除完了\n');
  console.log(`📊 結果:`);
  console.log(`  - 残した日報: ${keptCount} 件`);
  console.log(`  - 削除した日報: ${deletedCount} 件`);
  console.log(`  - 合計: ${keptCount + deletedCount} 件\n`);

  process.exit(0);
}

removeDuplicateReports().catch(err => {
  console.error('❌ エラー:', err);
  process.exit(1);
});
