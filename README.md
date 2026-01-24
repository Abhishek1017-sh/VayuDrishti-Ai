# VayuDrishti AI 🌬️💧

**IoT-based Air Quality & Water Resource Monitoring System**

VayuDrishti AI is a comprehensive full-stack application that monitors air quality and water resources in real-time using IoT sensors, estimates Air Quality Index (AQI), manages water tank levels, and automatically triggers corrective actions to maintain healthy environmental conditions.

---

## 🎯 Project Overview

**VayuDrishti** (Sanskrit: वायुदृष्टि) means "Vision of Air" - now expanded to include water resource management, representing our mission to provide clear insights into environmental quality and enable proactive resource management.

### Key Features

- **Real-time AQI Monitoring**: Live air quality index calculation from sensor data
- **Water Tank Monitoring**: Track municipal water levels with threshold alerts ✨ NEW
- **Smart Automation**: Automatic activation of water sprinkling and ventilation systems with water availability checks
- **Municipality Integration**: Automated alerts to water departments when tanks run low ✨ NEW
- **Intelligent Alerts**: Multi-level alert system with category-based filtering (Air Quality, Water Resource, Municipality, Device)
- **Sprinkler Safety**: Automatic disable during water shortages to prevent waste ✨ NEW
- **Advanced Analytics**: Historical data analysis with trend visualization
- **Modern UI**: Responsive, animated dashboard with water level gauges and status indicators
- **Role-based Access**: Admin, Industry, and Home user roles

---

## 🏗️ Architecture

```
VayuDrishti-AI/
├── backend/          # Node.js + Express API Server
│   ├── routes/       # API route definitions (alerts, sensors, aqi, water-tanks ✨)
│   ├── controllers/  # Business logic handlers
│   ├── services/     # Core processing services (waterMonitorService ✨, actionRouter)
│   ├── models/       # MongoDB schemas (WaterTank ✨, Alert, Device)
│   └── utils/        # Helper utilities
│
└── frontend/         # React + Tailwind CSS UI
    ├── src/
    │   ├── components/   # Reusable UI components
    │   │   ├── Alerts/   # Alert management (AlertCard, AlertFilter)
    │   │   └── WaterTank/  # Water widgets ✨ NEW
    │   ├── pages/        # Page components (AdminAlerts with water overview ✨)
    │   └── services/     # API integration (waterTankAPI ✨)
    └── public/           # Static assets
```

### Technology Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM ✨
- REST API architecture
- Water monitoring & automation services ✨

**Frontend:**
- React.js 18
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- Axios for API calls
- React Router for navigation

---

## 📊 Data Processing Pipeline

### 1. Sensor Data Reception
```
Raw Sensor Data (Air/Water) → Validation → Cleaning → Normalization
```

### 2. AQI Calculation
```
Pollution Index → Humidity Correction → AQI Mapping → Category Assignment
```

### 3. Water Level Monitoring ✨ NEW
```
Ultrasonic Reading → % Calculation → Threshold Check → Status Update → Alert/Action
```

### 4. Automation Triggering
```
AQI Analysis → Water Availability Check ✨ → Safety Delay → Action Execution → Cooldown
```

### Water Tank Thresholds ✨ NEW

| Level | Status | Color | Actions |
|-------|--------|-------|---------|
| >40% | NORMAL | 🟢 Green | Sprinklers available |
| 20-40% | LOW | 🟡 Yellow | Warning alert |
| 5-20% | CRITICAL | 🟠 Orange | Disable sprinklers + Notify municipality |
| <5% | EMPTY | 🔴 Red | Force pumps OFF + Emergency alert |

### AQI Categories

| Range | Category | Color | Action |
|-------|----------|-------|--------|
| 0-50 | Good | 🟢 Green | None |
| 51-100 | Moderate | 🟡 Yellow | Monitor |
| 101-150 | Poor | 🟠 Orange | Alert + Ventilation |
| 151-200 | Very Poor | 🔴 Red | Critical Alert + All Systems (if water available ✨) |
| 201-300 | Severe | 🟣 Purple | Emergency Response |
| 301+ | Hazardous | ⚫ Maroon | Immediate Action |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for water tank monitoring ✨)
- Modern web browser

### Quick Start (Windows) ✨

```bash
# One-command test
quick-test.bat
```

This will:
1. Seed water tanks database
2. Start backend server
3. Provide instructions for frontend and simulator

### Manual Installation

1. **Clone the repository**
```bash
cd VayuDrishti-Ai
```

2. **Backend Setup**
```bash
cd backend
npm install

# Seed water tanks (optional but recommended) ✨
node seed-water-tanks.js
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start  # or npm run dev
```
Server will run on `http://localhost:9000`

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

3. **Test Water Tank Monitoring (Optional)** ✨
```bash
cd backend
bash test-water-tank.sh  # Interactive simulator
```
Frontend will run on `http://localhost:3000`

3. **Access the Application**
Open your browser and navigate to `http://localhost:3000`

---

## 🔌 API Documentation

### Base URL
```
http://localhost:9000/api
```

### Endpoints

#### Sensor Data
```http
POST /sensors/data
Content-Type: application/json

{
  "smoke": 450,
  "humidity": 65,
  "location": "Building A",
  "timestamp": "2026-01-19T10:30:00Z"
}
```

#### Calculate AQI
```http
POST /aqi/calculate
Content-Type: application/json

{
  "smoke": 450,
  "humidity": 65
}
```

#### Get Dashboard Data
```http
GET /dashboard
```

#### Get Alerts
```http
GET /alerts?status=active&limit=50
```

#### Acknowledge Alert
```http
POST /alerts/acknowledge
Content-Type: application/json

{
  "alertId": "alert_123456",
  "acknowledgedBy": "admin"
}
```

---

## 🎨 Frontend Features

### Pages

1. **Login** - Role-based authentication (mock)
2. **Dashboard** - Real-time AQI display with sensor data and automation status
3. **Analytics** - Historical data visualization and trend analysis
4. **Alerts** - Alert management and acknowledgment
5. **Settings** - System configuration (demonstration)

### UI Components

- **AQI Card**: Large, color-coded AQI display
- **Sensor Panel**: Real-time sensor readings
- **Automation Panel**: System status with cooldown indicators
- **Alerts Widget**: Active alerts summary
- **Analytics Charts**: Time-series and distribution charts

### Animations

- Smooth page transitions
- Micro-animations on state changes
- Loading states with spinners
- Hover effects and scale transitions

---

## 🧮 Algorithms & Logic

### Data Cleaning
```javascript
// Noise reduction through smoothing
smoothedValue = applyMovingAverage(rawValue)

// Outlier removal
if (value < MIN || value > MAX) {
  value = lastValidValue
}
```

### Pollution Index Normalization
```javascript
// Linear mapping with non-linear curve
normalized = (smokeValue / 1023) * 100
pollutionIndex = (normalized / 100)^1.5 * 100
```

### Humidity Correction
```javascript
correctionFactor = humidity > 70 ? 0.85 : 
                  humidity > 50 ? 0.95 : 1.0
correctedIndex = pollutionIndex * correctionFactor
```

### Automation Logic
```javascript
if (AQI >= CRITICAL_THRESHOLD) {
  triggerWaterSprinkling()
  triggerVentilation()
  createCriticalAlert()
} else if (AQI >= ALERT_THRESHOLD) {
  triggerVentilation()
  createWarningAlert()
}
```

---

## 🔐 Security Features

- Input validation on all endpoints
- CORS configuration
- Environment variable management
- Error handling and logging
- Rate limiting (recommended for production)

---

## 🎓 Academic Context

This project demonstrates:

1. **Full-stack Development**: Integration of frontend and backend technologies
2. **IoT Data Processing**: Handling real-time sensor data streams
3. **Algorithm Implementation**: Data cleaning, normalization, and AQI calculation
4. **Automation Systems**: Rule-based triggering with safety mechanisms and water availability checks ✨
5. **Modern UI/UX**: Responsive design with animations and real-time gauges ✨
6. **API Design**: RESTful architecture with proper endpoints (9 water tank endpoints ✨)
7. **State Management**: Real-time data updates and synchronization with auto-refresh ✨
8. **Resource Management**: Municipal water tank monitoring with sprinkler safety integration ✨

---

## 💧 Water Tank Monitoring System ✨ NEW

### Overview
Integrated water resource management system that tracks municipal water tanks, prevents waste during shortages, and coordinates with water departments.

### Features
- **Real-time Level Tracking**: Ultrasonic sensor data processed every 30 seconds
- **Threshold Alerts**: 4-level system (NORMAL > LOW > CRITICAL > EMPTY)
- **Sprinkler Safety**: Automatic disable when water <20% to prevent waste
- **Municipality Integration**: Email/phone notifications to water departments
- **Zone-based Control**: Disable devices by geographic zone
- **Auto-recovery**: Sprinklers re-enable automatically after refill
- **Visual Dashboards**: Color-coded gauges and status indicators

### API Endpoints
```
GET    /api/water-tanks              # List all tanks
POST   /api/water-tanks/level        # Update from sensor
GET    /api/water-tanks/:id          # Get tank details
POST   /api/water-tanks/:id/refill-acknowledge  # Municipality response
```

### Testing
```bash
# Seed sample tanks
node backend/seed-water-tanks.js

# Run interactive simulator
cd backend
bash test-water-tank.sh
```

See **[PHASE_4_TESTING_GUIDE.md](PHASE_4_TESTING_GUIDE.md)** for complete testing procedures.

---

## 📈 Future Enhancements

- [x] ✅ Database integration (MongoDB with Mongoose)
- [x] ✅ Water tank monitoring system
- [x] ✅ Municipality alerting
- [x] ✅ Sprinkler safety integration
- [ ] Real IoT device connectivity (MQTT/WebSocket)
- [ ] Machine Learning for AQI prediction and water depletion forecasting
- [ ] Multi-location support
- [ ] Mobile application (React Native)
- [ ] Email/SMS notifications (partially implemented for water alerts)
- [x] ✅ Historical data export (CSV for alerts)
- [x] ✅ Admin dashboard for system monitoring
- [ ] User authentication with JWT (interceptor ready)
- [ ] Real-time WebSocket updates (currently polling)

---

## 🧪 Testing

### Air Quality Testing

1. **Test Sensor Data Reception**
```bash
curl -X POST http://localhost:9000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "ESP32_001", "mq": 450, "temperature": 28, "humidity": 65}'
```

2. **Test AQI Calculation**
```bash
curl -X POST http://localhost:9000/api/aqi/calculate \
  -H "Content-Type: application/json" \
  -d '{"smoke": 450, "humidity": 65}'
```

3. **Test Dashboard Retrieval**
```bash
curl http://localhost:9000/api/dashboard
```

### Water Tank Testing ✨ NEW

1. **Update Water Level**
```bash
curl -X POST http://localhost:9000/api/water-tanks/level \
  -H "Content-Type: application/json" \
  -d '{"tankId": "TANK_001", "waterLevel": 15, "sensorDeviceId": "ESP32_TANK_01"}'
```

2. **Get All Tanks**
```bash
curl http://localhost:9000/api/water-tanks
```

3. **Interactive Simulator**
```bash
cd backend
bash test-water-tank.sh
# Select from 6 test scenarios
```

**Complete Testing Guide:** See [PHASE_4_TESTING_GUIDE.md](PHASE_4_TESTING_GUIDE.md)

---

## 🤝 Contributing

This is an academic project. For improvements or suggestions:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📝 License

This project is created for educational purposes.

---

## 👥 Team

**VayuDrishti AI Development Team**

---

## 📞 Support

For questions or issues, please refer to the documentation or contact the development team.

---

## 🙏 Acknowledgments

- IoT sensor data processing concepts
- AQI calculation standards
- Modern web development best practices
- Open-source community for frameworks and libraries

---

**Built with ❤️ for a cleaner, healthier environment**
