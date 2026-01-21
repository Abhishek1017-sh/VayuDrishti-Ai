# VayuDrishti AI 🌬️

**IoT-based Air Quality Monitoring & Automation System**

VayuDrishti AI is a comprehensive full-stack application that monitors air quality in real-time using IoT sensors, estimates Air Quality Index (AQI), and automatically triggers corrective actions to maintain healthy air quality levels.

---

## 🎯 Project Overview

**VayuDrishti** (Sanskrit: वायुदृष्टि) means "Vision of Air" - representing our mission to provide clear insights into air quality and enable proactive environmental management.

### Key Features

- **Real-time AQI Monitoring**: Live air quality index calculation from sensor data
- **Smart Automation**: Automatic activation of water sprinkling and ventilation systems
- **Intelligent Alerts**: Multi-level alert system with escalation and tracking
- **Advanced Analytics**: Historical data analysis with trend visualization
- **Modern UI**: Responsive, animated dashboard with dark mode support
- **Role-based Access**: Admin, Industry, and Home user roles

---

## 🏗️ Architecture

```
VayuDrishti-AI/
├── backend/          # Node.js + Express API Server
│   ├── routes/       # API route definitions
│   ├── controllers/  # Business logic handlers
│   ├── services/     # Core processing services
│   └── utils/        # Helper utilities
│
└── frontend/         # React + Tailwind CSS UI
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Page components
    │   └── services/     # API integration
    └── public/           # Static assets
```

### Technology Stack

**Backend:**
- Node.js & Express.js
- REST API architecture
- In-memory data storage (production: MongoDB/PostgreSQL)

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
Raw Sensor Data → Validation → Cleaning → Normalization
```

### 2. AQI Calculation
```
Pollution Index → Humidity Correction → AQI Mapping → Category Assignment
```

### 3. Automation Triggering
```
AQI Analysis → Threshold Check → Safety Delay → Action Execution → Cooldown
```

### AQI Categories

| Range | Category | Color | Action |
|-------|----------|-------|--------|
| 0-50 | Good | 🟢 Green | None |
| 51-100 | Moderate | 🟡 Yellow | Monitor |
| 101-150 | Poor | 🟠 Orange | Alert + Ventilation |
| 151-200 | Very Poor | 🔴 Red | Critical Alert + All Systems |
| 201-300 | Severe | 🟣 Purple | Emergency Response |
| 301+ | Hazardous | ⚫ Maroon | Immediate Action |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
```bash
cd VayuDrishti-Ai
```

2. **Backend Setup**
```bash
cd backend
npm install
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
npm run dev
```
Server will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

3. **Access the Application**
Open your browser and navigate to `http://localhost:3000`

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
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
4. **Automation Systems**: Rule-based triggering with safety mechanisms
5. **Modern UI/UX**: Responsive design with animations
6. **API Design**: RESTful architecture with proper endpoints
7. **State Management**: Real-time data updates and synchronization

---

## 📈 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real IoT device connectivity (MQTT/WebSocket)
- [ ] Machine Learning for AQI prediction
- [ ] Multi-location support
- [ ] Mobile application
- [ ] Email/SMS notifications
- [ ] Historical data export (CSV/PDF)
- [ ] Admin dashboard for system configuration
- [ ] User authentication with JWT
- [ ] Real-time WebSocket updates

---

## 🧪 Testing

### Manual Testing

1. **Test Sensor Data Reception**
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 450, "humidity": 65}'
```

2. **Test AQI Calculation**
```bash
curl -X POST http://localhost:5000/api/aqi/calculate \
  -H "Content-Type: application/json" \
  -d '{"smoke": 450, "humidity": 65}'
```

3. **Test Dashboard Retrieval**
```bash
curl http://localhost:5000/api/dashboard
```

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
