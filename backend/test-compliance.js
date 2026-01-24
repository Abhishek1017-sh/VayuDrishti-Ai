/**
 * Test Compliance Report API
 */

const axios = require('axios');

async function testComplianceReport() {
  try {
    console.log('🧪 Testing Compliance Report API...\n');
    
    const facilityId = 'FACILITY_001';
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`📅 Date Range: ${startDate} to ${endDate}`);
    console.log(`🏭 Facility: ${facilityId}\n`);
    
    const url = `http://localhost:9000/api/industry/compliance/${facilityId}?startDate=${startDate}&endDate=${endDate}`;
    console.log(`🌐 URL: ${url}\n`);
    
    const response = await axios.get(url);
    
    console.log('✅ Success! Report Generated:\n');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testComplianceReport();
