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

async function checkAllData() {
  try {
    console.log('📊 全データを調査中...\n');

    // 日報データ
    const reportsSnapshot = await db.collection('daily_reports').get();
    console.log('='.repeat(80));
    console.log('📅 日報データ');
    console.log('='.repeat(80));
    console.log(`総数: ${reportsSnapshot.size}件\n`);

    const reports = [];
    reportsSnapshot.forEach(doc => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        reportDate: data.report_date || data.reportDate,
        staffName: data.staff_name || data.staffName,
        createdAt: data.createdAt?.toDate()
      });
    });

    // 日付でソート
    reports.sort((a, b) => {
      const dateA = a.reportDate || '';
      const dateB = b.reportDate || '';
      return dateB.localeCompare(dateA);
    });

    console.log('最新10件:');
    reports.slice(0, 10).forEach((report, i) => {
      console.log(`${i + 1}. 日付: ${report.reportDate}, スタッフ: ${report.staffName}, ID: ${report.id}`);
    });

    // 小話データ
    console.log('\n' + '='.repeat(80));
    console.log('📖 小話データ');
    console.log('='.repeat(80));

    const storiesSnapshot = await db.collection('short_stories').get();
    console.log(`総数: ${storiesSnapshot.size}件`);

    const activeStories = await db
      .collection('short_stories')
      .where('status', '==', 'active')
      .get();
    console.log(`activeな小話: ${activeStories.size}件\n`);

    const stories = [];
    activeStories.forEach(doc => {
      const data = doc.data();
      stories.push({
        id: doc.id,
        title: data.title,
        reportDate: data.reportDate || data.report_date,
        createdAt: data.createdAt?.toDate()
      });
    });

    stories.sort((a, b) => {
      const dateA = a.reportDate || '';
      const dateB = b.reportDate || '';
      return dateB.localeCompare(dateA);
    });

    console.log('最新10件:');
    stories.slice(0, 10).forEach((story, i) => {
      console.log(`${i + 1}. 日付: ${story.reportDate}, タイトル: ${story.title}`);
    });

    // ブログデータ
    console.log('\n' + '='.repeat(80));
    console.log('📝 ブログデータ');
    console.log('='.repeat(80));

    const blogsSnapshot = await db.collection('blog_posts').get();
    console.log(`総数: ${blogsSnapshot.size}件`);

    const publishedBlogs = await db
      .collection('blog_posts')
      .where('status', '==', 'published')
      .get();
    console.log(`公開済み: ${publishedBlogs.size}件\n`);

    const blogs = [];
    publishedBlogs.forEach(doc => {
      const data = doc.data();
      blogs.push({
        id: doc.id,
        title: data.title,
        publishedAt: data.publishedAt?.toDate()
      });
    });

    blogs.sort((a, b) => {
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return b.publishedAt - a.publishedAt;
    });

    console.log('最新10件:');
    blogs.slice(0, 10).forEach((blog, i) => {
      console.log(`${i + 1}. 公開日: ${blog.publishedAt?.toISOString().split('T')[0]}, タイトル: ${blog.title}`);
    });

    // サマリー
    console.log('\n' + '='.repeat(80));
    console.log('📊 サマリー');
    console.log('='.repeat(80));
    console.log(`日報: ${reportsSnapshot.size}件`);
    console.log(`小話: ${activeStories.size}件 / ${storiesSnapshot.size}件（active/全体）`);
    console.log(`ブログ: ${publishedBlogs.size}件 / ${blogsSnapshot.size}件（公開/全体）`);

    if (reportsSnapshot.size > activeStories.size) {
      console.log(`\n⚠️  警告: ${reportsSnapshot.size - activeStories.size}件の日報に対して小話が未生成`);
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    process.exit(0);
  }
}

checkAllData();
