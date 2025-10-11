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

async function checkDates() {
  try {
    console.log('📅 日付データを調査中...\n');

    // 小話の日付を確認
    console.log('='.repeat(80));
    console.log('📖 小話の日付');
    console.log('='.repeat(80));

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
        rawCreatedAt: data.createdAt,
        rawReportDate: data.reportDate
      });
    });

    stories.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt - a.createdAt;
    });

    console.log('最新5件の小話:');
    stories.slice(0, 5).forEach((story, i) => {
      console.log(`${i + 1}. ${story.title}`);
      console.log(`   reportDate: ${story.reportDate}`);
      console.log(`   createdAt: ${story.createdAt?.toISOString()}`);
      console.log('');
    });

    // ブログの日付を確認
    console.log('='.repeat(80));
    console.log('📝 ブログの日付');
    console.log('='.repeat(80));

    const blogsSnapshot = await db
      .collection('blog_posts')
      .where('status', '==', 'published')
      .get();

    const blogs = [];
    blogsSnapshot.forEach(doc => {
      const data = doc.data();
      blogs.push({
        id: doc.id,
        title: data.title,
        createdAt: data.createdAt?.toDate(),
        publishedAt: data.publishedAt?.toDate(),
        rawCreatedAt: data.createdAt,
        rawPublishedAt: data.publishedAt
      });
    });

    blogs.sort((a, b) => {
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return b.publishedAt - a.publishedAt;
    });

    console.log('最新10件のブログ:');
    blogs.slice(0, 10).forEach((blog, i) => {
      console.log(`${i + 1}. ${blog.title}`);
      console.log(`   createdAt: ${blog.createdAt?.toISOString()}`);
      console.log(`   publishedAt: ${blog.publishedAt?.toISOString()}`);
      console.log('');
    });

    // 日報の日付を確認
    console.log('='.repeat(80));
    console.log('📅 日報の日付');
    console.log('='.repeat(80));

    const reportsSnapshot = await db
      .collection('daily_reports')
      .get();

    const reports = [];
    reportsSnapshot.forEach(doc => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        reportDate: data.report_date || data.reportDate,
        createdAt: data.createdAt?.toDate()
      });
    });

    reports.sort((a, b) => {
      const dateA = a.reportDate || '';
      const dateB = b.reportDate || '';
      return dateB.localeCompare(dateA);
    });

    console.log('最新10件の日報:');
    reports.slice(0, 10).forEach((report, i) => {
      console.log(`${i + 1}. reportDate: ${report.reportDate}, createdAt: ${report.createdAt?.toISOString()}`);
    });

    // 日付の不一致チェック
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  日付の不一致をチェック');
    console.log('='.repeat(80));

    const storyReportDates = stories.map(s => s.reportDate);
    const reportDates = reports.map(r => r.reportDate);

    const uniqueStoryDates = [...new Set(storyReportDates)];
    const uniqueReportDates = [...new Set(reportDates)];

    console.log(`小話のユニークreportDate: ${uniqueStoryDates.length}件`);
    console.log(`日報のユニークreport_date: ${uniqueReportDates.length}件`);

    const missingStories = uniqueReportDates.filter(date => !uniqueStoryDates.includes(date));
    console.log(`\n小話が未生成の日報日付: ${missingStories.length}件`);
    if (missingStories.length > 0) {
      console.log('未生成の日付:', missingStories.sort().reverse().slice(0, 10).join(', '));
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    process.exit(0);
  }
}

checkDates();
