const http = require('http');

function testAPI(path, name) {
  return new Promise((resolve) => {
    console.log(`\n🔍 テスト: ${name}`);
    console.log(`   URL: http://localhost:3000${path}`);
    
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`   ステータス: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   ✅ 成功 - データ件数: ${Array.isArray(json) ? json.length : '1件'}`);
            if (json.title) console.log(`   タイトル: ${json.title}`);
          } catch (e) {
            console.log(`   ✅ 成功 - HTML返却`);
          }
        } else {
          console.log(`   ❌ エラー: ${data.substring(0, 200)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ 接続エラー: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ❌ タイムアウト`);
      req.destroy();
      resolve();
    });
  });
}

async function runTests() {
  console.log('📊 メインサイトAPIテスト開始\n');
  console.log('==========================================');
  
  await testAPI('/api/short-stories/featured', '小話API (featured)');
  await testAPI('/api/short-stories', '小話API (all)');
  
  console.log('\n==========================================\n');
  process.exit(0);
}

runTests();
