/**
 * Seed Industry Zones and Home Rooms
 * Initialize sample data for testing Industry and Home dashboards
 */

const mongoose = require('mongoose');
require('dotenv').config();

const IndustryZone = require('./models/IndustryZone');
const HomeRoom = require('./models/HomeRoom');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vayudrishti');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Industry Zones Data
const industryZones = [
  {
    zoneId: 'ZONE_PROD_A',
    zoneName: 'Production Zone A',
    facilityId: 'FACILITY_001',
    facilityName: 'Delhi Industrial Complex',
    zoneType: 'PRODUCTION',
    devices: ['ESP32_001', 'ESP32_002'],
    complianceLimit: 200,
    productionShift: {
      current: 'AFTERNOON',
      shiftStart: new Date(new Date().setHours(14, 0, 0, 0)),
      shiftEnd: new Date(new Date().setHours(22, 0, 0, 0)),
    },
    location: {
      lat: 28.6139,
      lng: 77.2090,
    },
  },
  {
    zoneId: 'ZONE_PROD_B',
    zoneName: 'Production Zone B',
    facilityId: 'FACILITY_001',
    facilityName: 'Delhi Industrial Complex',
    zoneType: 'PRODUCTION',
    devices: ['ESP32_003'],
    complianceLimit: 200,
    productionShift: {
      current: 'AFTERNOON',
      shiftStart: new Date(new Date().setHours(14, 0, 0, 0)),
      shiftEnd: new Date(new Date().setHours(22, 0, 0, 0)),
    },
    location: {
      lat: 28.6145,
      lng: 77.2095,
    },
  },
  {
    zoneId: 'ZONE_WAREHOUSE',
    zoneName: 'Warehouse',
    facilityId: 'FACILITY_001',
    facilityName: 'Delhi Industrial Complex',
    zoneType: 'WAREHOUSE',
    devices: [],
    complianceLimit: 150,
    productionShift: {
      current: 'OFF',
    },
    location: {
      lat: 28.6135,
      lng: 77.2085,
    },
  },
  {
    zoneId: 'ZONE_LOADING',
    zoneName: 'Loading Dock',
    facilityId: 'FACILITY_001',
    facilityName: 'Delhi Industrial Complex',
    zoneType: 'LOADING_DOCK',
    devices: [],
    complianceLimit: 180,
    productionShift: {
      current: 'AFTERNOON',
      shiftStart: new Date(new Date().setHours(14, 0, 0, 0)),
      shiftEnd: new Date(new Date().setHours(22, 0, 0, 0)),
    },
    location: {
      lat: 28.6130,
      lng: 77.2080,
    },
  },
  {
    zoneId: 'ZONE_OUTDOOR',
    zoneName: 'Outdoor Perimeter',
    facilityId: 'FACILITY_001',
    facilityName: 'Delhi Industrial Complex',
    zoneType: 'OUTDOOR',
    devices: [],
    complianceLimit: 250,
    productionShift: {
      current: 'OFF',
    },
    location: {
      lat: 28.6140,
      lng: 77.2100,
    },
  },
];

// Home Rooms Data
const homeRooms = [
  {
    roomId: 'ROOM_LIVING',
    roomName: 'Living Room',
    homeId: 'HOME_001',
    homeName: 'Sharma Residence',
    roomType: 'LIVING_ROOM',
    deviceId: 'ESP32_001',
    occupants: {
      total: 4,
      vulnerable: false,
    },
    preferences: {
      aqiThreshold: 100,
      notificationsEnabled: true,
    },
  },
  {
    roomId: 'ROOM_KITCHEN',
    roomName: 'Kitchen',
    homeId: 'HOME_001',
    homeName: 'Sharma Residence',
    roomType: 'KITCHEN',
    deviceId: 'ESP32_002',
    occupants: {
      total: 4,
      vulnerable: false,
    },
    preferences: {
      aqiThreshold: 120,
      notificationsEnabled: true,
    },
  },
  {
    roomId: 'ROOM_BEDROOM',
    roomName: 'Master Bedroom',
    homeId: 'HOME_001',
    homeName: 'Sharma Residence',
    roomType: 'BEDROOM',
    deviceId: 'ESP32_003',
    occupants: {
      total: 2,
      vulnerable: true, // Elderly parents
    },
    preferences: {
      aqiThreshold: 80,
      notificationsEnabled: true,
    },
  },
  {
    roomId: 'ROOM_OUTDOOR',
    roomName: 'Outdoor Garden',
    homeId: 'HOME_001',
    homeName: 'Sharma Residence',
    roomType: 'OUTDOOR',
    deviceId: null,
    occupants: {
      total: 0,
      vulnerable: false,
    },
    preferences: {
      aqiThreshold: 150,
      notificationsEnabled: false,
    },
  },
];

async function seedData() {
  try {
    await connectDB();

    console.log('\n🌱 Seeding Industry Zones...');
    
    // Clear existing data
    await IndustryZone.deleteMany({});
    console.log('   Cleared existing industry zones');

    // Insert industry zones
    const insertedZones = await IndustryZone.insertMany(industryZones);
    console.log(`   ✅ Inserted ${insertedZones.length} industry zones:`);
    insertedZones.forEach(zone => {
      console.log(`      - ${zone.zoneName} (${zone.zoneId}) - ${zone.zoneType}`);
    });

    console.log('\n🏠 Seeding Home Rooms...');
    
    // Clear existing data
    await HomeRoom.deleteMany({});
    console.log('   Cleared existing home rooms');

    // Insert home rooms
    const insertedRooms = await HomeRoom.insertMany(homeRooms);
    console.log(`   ✅ Inserted ${insertedRooms.length} home rooms:`);
    insertedRooms.forEach(room => {
      console.log(`      - ${room.roomName} (${room.roomId}) - ${room.roomType}`);
    });

    console.log('\n✅ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Industry Zones: ${insertedZones.length}`);
    console.log(`   Home Rooms: ${insertedRooms.length}`);
    console.log(`   Facility ID: FACILITY_001`);
    console.log(`   Home ID: HOME_001`);
    console.log('\n💡 Usage:');
    console.log(`   Industry Dashboard: http://localhost:9000/api/industry/dashboard/FACILITY_001`);
    console.log(`   Home Dashboard: http://localhost:9000/api/home/dashboard/HOME_001`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedData();
