const missingReports = [
  '177bdab1-81b3-4976-9170-b0770abc9bfb', // 2025-08-25 中学2年女子
  '45afe5cd-cc7a-4823-8c61-f417dcd8119c',  // 2025-08-25 20代女性
  '31bb3001-7e82-4abd-a248-54cd7c082e07',  // 2025-08-24 23歳男性
  '7c09177f-0b2d-4d07-8403-1b330ad4339e'   // 2025-08-24 兄弟
];

// 不足している小話IDリスト
console.log('不足している日報ID:');
missingReports.forEach(id => console.log(id));

// curl コマンドを生成
console.log('\n=== 生成用curlコマンド ===');
missingReports.forEach((id, index) => {
  console.log(`# ${index + 1}. ${id}`);
  console.log(`curl -X POST http://localhost:3002/api/short-stories/generate-by-id -H "Content-Type: application/json" -d '{"report_id": "${id}"}'`);
  console.log('');
});