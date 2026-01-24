/**
 * Seed Water Tank Data
 * Initialize sample water tank configurations for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const WaterTank = require('./models/WaterTank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vayudrishti';

// Sample water tanks
const sampleTanks = [
  {
    tankId: 'TANK_001',
    zone: 'Zone A',
    location: {
      lat: 28.6139,
      long: 77.2090
    },
    capacity: 5000,
    currentLevel: 85,
    status: 'NORMAL',
    sensorDeviceId: 'ESP32_TANK_01',
    municipality: {
      name: 'Delhi Municipal Corporation - Zone A',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh.kumar@dmc.gov.in',
      phone: '+91-11-2345-6789',
      address: 'Municipal Office, Connaught Place, New Delhi - 110001'
    },
    isActive: true
  },
  {
    tankId: 'TANK_002',
    zone: 'Zone B',
    location: {
      lat: 28.7041,
      long: 77.1025
    },
    capacity: 3000,
    currentLevel: 60,
    status: 'NORMAL',
    sensorDeviceId: 'ESP32_TANK_02',
    municipality: {
      name: 'Delhi Municipal Corporation - Zone B',
      contactPerson: 'Priya Sharma',
      email: 'priya.sharma@dmc.gov.in',
      phone: '+91-11-2345-6790',
      address: 'Municipal Office, Rohini, New Delhi - 110085'
    },
    isActive: true
  },
  {
    tankId: 'TANK_003',
    zone: 'Industrial Zone',
    location: {
      lat: 28.5355,
      long: 77.3910
    },
    capacity: 10000,
    currentLevel: 45,
    status: 'NORMAL',
    sensorDeviceId: 'ESP32_TANK_03',
    municipality: {
      name: 'Noida Municipal Corporation',
      contactPerson: 'Amit Verma',
      email: 'amit.verma@nmc.gov.in',
      phone: '+91-120-2345-6789',
      address: 'Municipal Office, Sector 16, Noida - 201301'
    },
    isActive: true
  }
];

async function seedWaterTanks() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing water tanks
    console.log('🗑️  Clearing existing water tanks...');
    await WaterTank.deleteMany({});
    console.log('✅ Cleared');

    // Insert sample tanks
    console.log('📦 Inserting sample water tanks...');
    const tanks = await WaterTank.insertMany(sampleTanks);
    console.log(`✅ Inserted ${tanks.length} water tanks`);

    // Display created tanks
    console.log('\n📋 Created Water Tanks:');
    console.log('━'.repeat(80));
    tanks.forEach(tank => {
      console.log(`🏗️  ${tank.tankId} (${tank.zone})`);
      console.log(`   📊 Level: ${tank.currentLevel}% | Status: ${tank.status}`);
      console.log(`   📍 Location: ${tank.location.lat}°N, ${tank.location.long}°E`);
      console.log(`   🏛️  Municipality: ${tank.municipality.name}`);
      console.log(`   📱 Sensor: ${tank.sensorDeviceId}`);
      console.log('');
    });
    console.log('━'.repeat(80));

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: chmod +x backend/test-water-tank.sh');
    console.log('   2. Run: ./backend/test-water-tank.sh');
    console.log('   3. Test scenarios to trigger water alerts');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seed
seedWaterTanks();
