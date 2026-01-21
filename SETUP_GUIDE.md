# VayuDrishti AI - Quick Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A code editor (VS Code recommended)

---

## ⚡ Quick Start

### 1. Navigate to Project Directory

```bash
cd VayuDrishti-Ai
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Start the Application

You need **two terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
==================================================
🚀 VayuDrishti AI Backend Server Running
📡 Port: 5000
🌍 Environment: development
⏰ Started at: 2026-01-19T...
==================================================
```

#### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 4. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

---

## 🎮 Using the Application

### Login

1. Select a role:
   - **Admin** - Full system access
   - **Industry** - Industrial monitoring
   - **Home User** - Residential tracking

2. Click "Continue to Dashboard"

### Dashboard

- View real-time AQI
- Monitor sensor readings
- Check automation status
- See active alerts

### Testing with Sample Data

Open a new terminal and send sample sensor data:

```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 450, "humidity": 65, "location": "Test Location"}'
```

The dashboard will update automatically!

---

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# AQI Thresholds
AQI_ALERT_THRESHOLD=100
AQI_CRITICAL_THRESHOLD=150

# Automation Settings
SPRINKLING_COOLDOWN_MINUTES=30
VENTILATION_COOLDOWN_MINUTES=15
SAFETY_DELAY_SECONDS=5
```

### Frontend Configuration

Create `frontend/.env` (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📱 Features to Explore

1. **Dashboard**
   - Live AQI display
   - Sensor data panel
   - Automation status
   - Active alerts widget

2. **Analytics**
   - AQI trends over time
   - Category distribution
   - Historical data analysis

3. **Alerts**
   - View all alerts
   - Filter by status
   - Acknowledge alerts

4. **Settings**
   - Configure thresholds
   - Adjust automation settings
   - Set location details

---

## 🧪 Testing the System

### Send Different AQI Levels

**Good Air Quality (AQI ~40):**
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 200, "humidity": 50}'
```

**Moderate Air Quality (AQI ~80):**
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 400, "humidity": 60}'
```

**Poor Air Quality (AQI ~120):**
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 600, "humidity": 70}'
```

**Very Poor Air Quality (AQI ~180):**
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 800, "humidity": 75}'
```

Watch the dashboard update and automation systems activate!

---

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 or 3000 is busy:

**Backend:**
```bash
# Edit backend/.env
PORT=5001
```

**Frontend:**
```bash
# Edit frontend/vite.config.js
server: {
  port: 3001
}
```

### CORS Issues

Make sure backend server is running before starting frontend.

### Module Not Found

```bash
# Re-install dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Clear cache and rebuild:

```bash
# Frontend
cd frontend
rm -rf node_modules/.vite
npm run dev
```

---

## 📚 Next Steps

1. **Explore the Code**
   - Backend: `backend/services/` - Core logic
   - Frontend: `frontend/src/components/` - UI components

2. **Read Documentation**
   - `README.md` - Full project overview
   - `backend/API_DOCUMENTATION.md` - API reference

3. **Customize**
   - Modify AQI thresholds
   - Adjust automation cooldowns
   - Change UI colors and styling

---

## 💡 Tips

- **Dark Mode**: Click the moon/sun icon in the header
- **Refresh Data**: Use the refresh button on dashboard
- **View Logs**: Check terminal output for real-time logs
- **API Testing**: Use Postman or cURL for API testing

---

## 🎓 For Academic Presentation

### Key Points to Demonstrate:

1. **Real-time Monitoring**: Show live AQI updates
2. **Data Processing**: Explain cleaning and normalization
3. **Automation Logic**: Trigger alerts by sending high values
4. **Modern UI**: Showcase animations and responsiveness
5. **Analytics**: Display trends and historical data

### Sample Demonstration Flow:

1. Login as Admin
2. Show clean dashboard (Good AQI)
3. Send high smoke value → Trigger automation
4. View alerts being created
5. Show analytics with historical data
6. Acknowledge alerts
7. Explain architecture and code structure

---

## ❓ Need Help?

- Check console logs in browser (F12)
- Check terminal output for errors
- Refer to API documentation
- Review code comments

---

**You're all set! 🚀 Enjoy exploring VayuDrishti AI!**
