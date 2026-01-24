const mongoose = require('mongoose');
const IndustryService = require('./services/industryService');

async function testService() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/vayudrishti');
    console.log('✅ Connected to database');
    
    console.log('\nTesting IndustryService.getDashboardSummary...');
    const result = await IndustryService.getDashboardSummary('FACILITY_001');
    
    console.log('\n✅ Success! Dashboard data:');
    console.log(JSON.stringify(result, null, 2));
    
    await mongoose.disconnect();
    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testService();
