/**
 * Seed Sample Sensor Data
 * Creates realistic AQI data with some violations for testing compliance reports
 */

const mongoose = require('mongoose');
require('dotenv').config();

const SensorData = require('./models/SensorData');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vayudrishti';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const generateSensorData = () => {
  const data = [];
  const devices = ['ESP32_001', 'ESP32_002', 'ESP32_003'];
  const now = new Date();
  
  // Generate data for last 30 days
  for (let day = 0; day < 30; day++) {
    for (let hour = 0; hour < 24; hour++) {
      for (const deviceId of devices) {
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);
        
        // Base AQI varies by hour (production hours are higher)
        let baseAQI = 80;
        if (hour >= 8 && hour <= 18) {
          baseAQI = 120; // Production hours
        }
        
        // Add some randomness
        const variation = Math.random() * 60 - 30;
        const aqi = Math.max(20, Math.round(baseAQI + variation));
        
        // Occasional spikes (violations)
        const hasSpike = Math.random() < 0.1; // 10% chance of spike
        const finalAQI = hasSpike ? aqi + Math.round(Math.random() * 100) : aqi;
        
        // Determine status based on AQI
        let status = 'GOOD';
        if (finalAQI > 300) status = 'SEVERE';
        else if (finalAQI > 200) status = 'VERY_POOR';
        else if (finalAQI > 150) status = 'POOR';
        else if (finalAQI > 100) status = 'MODERATE';
        
        data.push({
          deviceId,
          mq: Math.round(Math.random() * 1023),
          aqi: finalAQI,
          pm25: Math.round(finalAQI * 0.4),
          pm10: Math.round(finalAQI * 0.7),
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
          smoke: finalAQI > 150 ? Math.random() * 500 : Math.random() * 100,
          co2: 400 + Math.random() * 600,
          status,
          timestamp,
          createdAt: timestamp,
          location: deviceId === 'ESP32_001' ? 'Production Zone A' :
                   deviceId === 'ESP32_002' ? 'Production Zone A' :
                   'Production Zone B'
        });
      }
    }
  }
  
  return data;
};

async function seedData() {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing sensor data...');
    await SensorData.deleteMany({});
    
    console.log('📊 Generating sensor data...');
    const sensorData = generateSensorData();
    
    console.log(`💾 Inserting ${sensorData.length} sensor readings...`);
    await SensorData.insertMany(sensorData);
    
    console.log(`✅ Successfully seeded ${sensorData.length} sensor data points`);
    
    // Show some stats
    const violations = sensorData.filter(d => d.aqi > 200).length;
    const avgAQI = Math.round(sensorData.reduce((sum, d) => sum + d.aqi, 0) / sensorData.length);
    const maxAQI = Math.max(...sensorData.map(d => d.aqi));
    
    console.log('\n📈 Statistics:');
    console.log(`   Average AQI: ${avgAQI}`);
    console.log(`   Peak AQI: ${maxAQI}`);
    console.log(`   Violations (AQI > 200): ${violations}`);
    console.log(`   Compliance Rate: ${((sensorData.length - violations) / sensorData.length * 100).toFixed(1)}%`);
    
    await mongoose.disconnect();
    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
