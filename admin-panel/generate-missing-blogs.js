/**
 * 既存の日報から不足しているブログを自動生成するスクリプト
 */

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

// Claude APIでブログ生成
async function generateBlogWithClaude(reportPair) {
  const CLAUDE_KEY = process.env.CLAUDE_KEY1;

  if (!CLAUDE_KEY) {
    throw new Error('CLAUDE_KEY1環境変数が設定されていません');
  }

  const systemPrompt = `あなたは、障害者専門サロン「Dupe & More」の編集責任者です。
与えられた「日誌2件（ペア）」から、障害のあるお子さまの保護者に
"読みやすく、感情に届く"ブログ記事を安全に生成してください。

【必須条件】
- タイトル：10〜24文字、感情に響くが誇大でない。
- 本文：約2000字（±10%）、H2見出しをちょうど4本。
- 見出しは Markdown 形式で「## ○○」。
- 清書規則は生成後に別フェーズ（CLAUDE_CLEAN_KEY）で適用する。
- 絵文字・装飾記号は禁止。日本語・ですます調。
- 内容は「共感→配慮→前進→初めての方へ」の流れ。

【出力仕様】
JSON 形式：
{
  "title": "…",
  "summary": "120〜160字。本文を読むメリットを静かに示す要約",
  "outline": ["共感：…","配慮：…","前進：…","初めての方へ：…"],
  "body": "## 共感：...\\n本文（清書前の段落）…\\n\\n## 配慮：...\\n…\\n\\n## 前進：...\\n…\\n\\n## 初めての方へ：...\\n…",
  "diagnostics": {"length_ok":true,"linewrap_ok":false,"safe_language":true}
}`;

  const userPrompt = `# 入力：日誌ペア JSON
report_pair = ${JSON.stringify(reportPair, null, 2)}

# タスク
1) date 昇順に並べる。
2) それぞれ 80〜120字で PII 一般化＆要約（内部分析）。
3) 保護者に刺さる核テーマを抽出。
4) 見出し4本のプロットを立て、約2000字で執筆。
5) JSON で出力（清書は後工程で行うため未整形で可）。`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 6000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\n${userPrompt}`
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errorText}`);
  }

  const claudeResponse = await response.json();
  const generatedText = claudeResponse.content[0].text;

  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON not found in response');
  }

  const cleanedJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
  return JSON.parse(cleanedJson);
}

// Claude APIで清書
async function cleanBlogWithClaude(body) {
  const CLAUDE_CLEAN_KEY = process.env.CLAUDE_CLEAN_KEY;

  if (!CLAUDE_CLEAN_KEY) {
    throw new Error('CLAUDE_CLEAN_KEY環境変数が設定されていません');
  }

  const systemPrompt = `あなたは清書専用アシスタントです。
本文を次のルールで厳密に整形します：

【必須ルール】
1. 1文を3〜4行に分割し、行末で改行＋改行直後に半角空白1つ
2. 各行は20〜25文字で改行（句読点優先、語中分割は避ける）
3. 見出し（##）、要約、JSON構造は変更しない
4. 本文のみを整形対象とする

整形済み本文のみを返してください。`;

  const userPrompt = `以下の本文を20-25文字改行ルールで整形してください：

${body}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_CLEAN_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\n${userPrompt}`
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude Clean API error: ${response.status} ${errorText}`);
  }

  const claudeResponse = await response.json();
  return claudeResponse.content[0].text;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

async function generateMissingBlogs() {
  try {
    console.log('🔍 既存データを確認中...\n');

    // すべての日報を取得
    const reportsSnapshot = await db
      .collection('daily_reports')
      .orderBy('reportDate', 'desc')
      .get();

    const allReports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📋 日報: ${allReports.length}件`);

    // すべてのブログを取得
    const blogsSnapshot = await db.collection('blog_posts').get();
    const existingBlogs = blogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📰 既存ブログ: ${existingBlogs.length}件\n`);

    // 使用済み日付を抽出
    const usedDates = new Set();
    existingBlogs.forEach(blog => {
      if (blog.newerDate) usedDates.add(blog.newerDate);
      if (blog.olderDate) usedDates.add(blog.olderDate);
    });

    console.log(`📅 使用済み日付: ${usedDates.size}件`);

    // 未使用の日報を抽出（有効なデータのみ）
    const unusedReports = allReports.filter(report =>
      !usedDates.has(report.reportDate) &&
      report.customerAttributes &&
      report.customerAttributes.trim() !== ''
    );

    console.log(`✅ 未使用の日報: ${unusedReports.length}件\n`);

    if (unusedReports.length < 2) {
      console.log('⚠️  未使用の日報が2件未満のため、生成できません');
      process.exit(0);
    }

    // ペアを作成
    const pairs = [];
    for (let i = 0; i < unusedReports.length - 1; i += 2) {
      pairs.push({
        newer: unusedReports[i],
        older: unusedReports[i + 1]
      });
    }

    console.log(`📊 生成可能なブログ: ${pairs.length}件\n`);

    if (pairs.length === 0) {
      console.log('⚠️  生成するブログペアがありません');
      process.exit(0);
    }

    // 各ペアからブログを生成
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`ブログ ${i + 1}/${pairs.length} を生成中...`);
      console.log(`日報: ${pair.newer.reportDate} と ${pair.older.reportDate}`);
      console.log(`${'='.repeat(60)}\n`);

      try {
        // ブログ生成
        console.log('🤖 Claude APIでブログ生成中...');
        const generatedBlog = await generateBlogWithClaude(pair);
        console.log(`✅ 生成完了: ${generatedBlog.title}`);

        // 清書
        console.log('🎨 清書中...');
        const cleanedBody = await cleanBlogWithClaude(generatedBlog.body);
        console.log('✅ 清書完了');

        // Firestoreに保存
        console.log('💾 Firestoreに保存中...');
        const blogRef = db.collection('blog_posts').doc();
        await blogRef.set({
          title: generatedBlog.title,
          slug: generateSlug(generatedBlog.title),
          summary: generatedBlog.summary,
          content: cleanedBody,
          newerDate: pair.newer.reportDate,
          olderDate: pair.older.reportDate,
          status: 'published',
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
          authorId: null,
          originalReportId: pair.newer.id,
          tags: ['日報', '脱毛', '障害者専門'],
          excerpt: generatedBlog.summary,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ 保存完了: ${blogRef.id}\n`);

        // API制限を考慮して待機
        if (i < pairs.length - 1) {
          console.log('⏳ 次のブログ生成まで3秒待機...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ ブログ ${i + 1} の生成に失敗:`, error.message);
        console.log('⏭️  次のブログに進みます...\n');
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 ブログ生成完了！');
    console.log(`${'='.repeat(60)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

generateMissingBlogs();
