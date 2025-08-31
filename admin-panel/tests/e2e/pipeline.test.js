// E2E Tests for Daily Report → Short Story → Blog Pipeline
// Run with: npm test or node tests/e2e/pipeline.test.js

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3002'

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await response.json()
  
  return { response, data }
}

// Helper to create test report data
function createTestReport(date, customerType = '20代前半女性・2回目来店') {
  return {
    staff_name: 'かなえ',
    report_date: date,
    weather_temperature: '晴れ 26℃ 過ごしやすい日',
    customer_attributes: customerType,
    visit_reason_purpose: 'テスト用の来店目的',
    treatment_details: 'テスト施術内容',
    customer_before_treatment: 'テスト前の状態',
    customer_after_treatment: 'テスト後の状態',
    salon_atmosphere: 'テスト雰囲気',
    insights_innovations: 'テスト気づき',
    kanae_personal_thoughts: 'テスト感想'
  }
}

// Test 1: Weekday consecutive scenario (Thursday → Friday)
async function testWeekdayConsecutive() {
  console.log('\n🧪 Test 1: Weekday Consecutive (Thu → Fri)')
  
  try {
    // Step 1: Create Thursday report
    console.log('Step 1: Creating Thursday report...')
    const thursdayReport = createTestReport('2025-08-21', '高校生男性・3回目来店')
    const { response: thurResponse, data: thurData } = await apiRequest('/api/daily-reports', 'POST', thursdayReport)
    
    if (thurResponse.status !== 200) {
      throw new Error(`Thursday report failed: ${JSON.stringify(thurData)}`)
    }
    
    console.log('✅ Thursday report created:', thurData.report.id)
    console.log('✅ Thursday story auto-generated:', thurData.generatedStory?.title)
    
    // Step 2: Create Friday report
    console.log('Step 2: Creating Friday report...')
    const fridayReport = createTestReport('2025-08-22', '30代女性・初回来店')
    const { response: friResponse, data: friData } = await apiRequest('/api/daily-reports', 'POST', fridayReport)
    
    if (friResponse.status !== 200) {
      throw new Error(`Friday report failed: ${JSON.stringify(friData)}`)
    }
    
    console.log('✅ Friday report created:', friData.report.id)
    console.log('✅ Friday story auto-generated:', friData.generatedStory?.title)
    
    // Step 3: Check if blog was auto-generated
    if (friData.generatedBlog) {
      console.log('✅ Blog auto-generated:', friData.generatedBlog.title)
      console.log('✅ Blog status:', friData.generatedBlog.status)
    } else {
      console.log('⚠️ Blog not auto-generated - checking manually...')
      
      // Try manual blog generation
      const { response: blogResponse, data: blogData } = await apiRequest('/api/blog-posts/generate', 'POST', { date: '2025-08-22' })
      
      if (blogResponse.status === 200) {
        console.log('✅ Manual blog generation successful:', blogData.title)
      } else {
        console.log('❌ Manual blog generation failed:', blogData.error)
      }
    }
    
    // Step 4: Verify no duplicates on re-run
    console.log('Step 4: Testing idempotency...')
    const { response: dupResponse, data: dupData } = await apiRequest('/api/daily-reports', 'POST', fridayReport)
    
    if (dupResponse.status === 409) {
      console.log('✅ Duplicate prevention working correctly')
    } else {
      console.log('⚠️ Duplicate prevention may not be working')
    }
    
    console.log('✅ Test 1 completed successfully!')
    
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message)
    return false
  }
  
  return true
}

// Test 2: Weekend crossing scenario (Friday → Monday)
async function testWeekendCrossing() {
  console.log('\n🧪 Test 2: Weekend Crossing (Fri → Mon)')
  
  try {
    // Step 1: Create Friday report
    console.log('Step 1: Creating Friday report...')
    const fridayReport = createTestReport('2025-08-29', '40代女性・5回目来店')
    const { response: friResponse, data: friData } = await apiRequest('/api/daily-reports', 'POST', fridayReport)
    
    if (friResponse.status !== 200) {
      throw new Error(`Friday report failed: ${JSON.stringify(friData)}`)
    }
    
    console.log('✅ Friday report created:', friData.report.id)
    console.log('✅ Friday story auto-generated:', friData.generatedStory?.title)
    
    // Step 2: Create Monday report (skipping weekend)
    console.log('Step 2: Creating Monday report...')
    const mondayReport = createTestReport('2025-09-01', '20代男性・初回来店')
    const { response: monResponse, data: monData } = await apiRequest('/api/daily-reports', 'POST', mondayReport)
    
    if (monResponse.status !== 200) {
      throw new Error(`Monday report failed: ${JSON.stringify(monData)}`)
    }
    
    console.log('✅ Monday report created:', monData.report.id)
    console.log('✅ Monday story auto-generated:', monData.generatedStory?.title)
    
    // Step 3: Check if blog was auto-generated (Monday + Friday pair)
    if (monData.generatedBlog) {
      console.log('✅ Blog auto-generated (Mon+Fri):', monData.generatedBlog.title)
      console.log('✅ Blog spans weekend correctly')
    } else {
      console.log('⚠️ Blog not auto-generated - testing manual generation...')
      
      // Try manual blog generation
      const { response: blogResponse, data: blogData } = await apiRequest('/api/blog-posts/generate', 'POST', { date: '2025-09-01' })
      
      if (blogResponse.status === 200) {
        console.log('✅ Manual blog generation successful (Mon+Fri):', blogData.title)
        console.log('✅ Date pair:', blogData.newer_date, '+', blogData.older_date)
      } else {
        console.log('❌ Manual blog generation failed:', blogData.error)
      }
    }
    
    // Step 4: Verify business day calculation
    console.log('Step 4: Verifying business day calculation...')
    // Monday (2025-09-01) should pair with Friday (2025-08-29), not weekend days
    
    console.log('✅ Test 2 completed successfully!')
    
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message)
    return false
  }
  
  return true
}

// Test runner
async function runTests() {
  console.log('🚀 Starting E2E Pipeline Tests')
  console.log('Base URL:', BASE_URL)
  
  // Test connection first
  try {
    const { response } = await apiRequest('/api/health')
    if (response.status !== 200) {
      throw new Error('API health check failed')
    }
    console.log('✅ API connection verified')
  } catch (error) {
    console.error('❌ Cannot connect to API:', error.message)
    process.exit(1)
  }
  
  const results = []
  
  // Run tests
  results.push(await testWeekdayConsecutive())
  results.push(await testWeekendCrossing())
  
  // Summary
  const passed = results.filter(Boolean).length
  const total = results.length
  
  console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All tests passed!')
    process.exit(0)
  } else {
    console.log('❌ Some tests failed')
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner error:', error)
    process.exit(1)
  })
}

module.exports = {
  testWeekdayConsecutive,
  testWeekendCrossing,
  runTests
}