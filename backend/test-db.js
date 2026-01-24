const mongoose = require('mongoose');
const IndustryZone = require('./models/IndustryZone');

async function testDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/vayudrishti');
    console.log('✅ Connected to database');
    
    const zones = await IndustryZone.find({ facilityId: 'FACILITY_001' });
    console.log(`\nFound ${zones.length} zones for FACILITY_001:`);
    
    zones.forEach(zone => {
      console.log(`- ${zone.zoneName} (${zone.zoneId}): ${zone.zoneType}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDB();
