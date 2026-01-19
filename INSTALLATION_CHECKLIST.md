# VayuDrishti AI - Installation & Verification Checklist

## ✅ Complete File Structure Created

```
VayuDrishti-Ai/
│
├── 📚 Root Documentation (7 files)
│   ✅ README.md
│   ✅ SETUP_GUIDE.md
│   ✅ ARCHITECTURE.md
│   ✅ TESTING_GUIDE.md
│   ✅ PROJECT_SUMMARY.md
│   ✅ package.json
│   ✅ .gitignore
│
├── 🔧 Backend (15 files)
│   ├── ✅ server.js
│   ├── ✅ package.json
│   ├── ✅ .env
│   ├── ✅ .gitignore
│   ├── ✅ API_DOCUMENTATION.md
│   │
│   ├── routes/ (4 files)
│   │   ✅ sensorRoutes.js
│   │   ✅ aqiRoutes.js
│   │   ✅ dashboardRoutes.js
│   │   ✅ alertRoutes.js
│   │
│   ├── controllers/ (4 files)
│   │   ✅ sensorController.js
│   │   ✅ aqiController.js
│   │   ✅ dashboardController.js
│   │   ✅ alertController.js
│   │
│   ├── services/ (3 files)
│   │   ✅ sensorService.js
│   │   ✅ aqiService.js
│   │   ✅ automationService.js
│   │
│   └── utils/ (1 file)
│       ✅ dataStore.js
│
└── 🎨 Frontend (18 files)
    ├── ✅ index.html
    ├── ✅ package.json
    ├── ✅ vite.config.js
    ├── ✅ tailwind.config.js
    ├── ✅ postcss.config.js
    ├── ✅ .gitignore
    │
    └── src/
        ├── ✅ main.jsx
        ├── ✅ App.jsx
        ├── ✅ index.css
        │
        ├── pages/ (5 files)
        │   ✅ Login.jsx
        │   ✅ Dashboard.jsx
        │   ✅ Analytics.jsx
        │   ✅ Alerts.jsx
        │   ✅ Settings.jsx
        │
        ├── components/ (5 files)
        │   ✅ Layout.jsx
        │   └── dashboard/
        │       ✅ AQICard.jsx
        │       ✅ SensorPanel.jsx
        │       ✅ AutomationPanel.jsx
        │       ✅ AlertsWidget.jsx
        │
        └── services/ (1 file)
            ✅ api.js
```

**Total Files Created: 44**

---

## 📋 Pre-Installation Checklist

Before running the application, ensure you have:

- [ ] Node.js v16 or higher installed
  ```bash
  node --version
  ```

- [ ] npm installed
  ```bash
  npm --version
  ```

- [ ] Git installed (optional)
  ```bash
  git --version
  ```

---

## 🚀 Installation Steps

### Step 1: Install Backend Dependencies

```bash
cd C:\Users\Asus\Desktop\projects\VayuDrishti-Ai\backend
npm install
```

**Expected packages:**
- express
- cors
- dotenv
- body-parser
- axios
- nodemon (dev)

### Step 2: Install Frontend Dependencies

```bash
cd C:\Users\Asus\Desktop\projects\VayuDrishti-Ai\frontend
npm install
```

**Expected packages:**
- react
- react-dom
- react-router-dom
- axios
- recharts
- framer-motion
- lucide-react
- tailwindcss
- vite
- autoprefixer
- postcss

---

## ✅ Verification Checklist

### Backend Verification

1. **Check package.json exists**
   ```bash
   cd backend
   Get-Content package.json
   ```

2. **Check .env file**
   ```bash
   Get-Content .env
   ```
   Should contain:
   - PORT=5000
   - AQI_ALERT_THRESHOLD=100
   - AQI_CRITICAL_THRESHOLD=150

3. **Verify all routes exist**
   ```bash
   Get-ChildItem routes
   ```
   Should show 4 files

4. **Verify all controllers exist**
   ```bash
   Get-ChildItem controllers
   ```
   Should show 4 files

5. **Verify all services exist**
   ```bash
   Get-ChildItem services
   ```
   Should show 3 files

### Frontend Verification

1. **Check package.json exists**
   ```bash
   cd ..\frontend
   Get-Content package.json
   ```

2. **Check Tailwind config**
   ```bash
   Get-Content tailwind.config.js
   ```

3. **Verify pages exist**
   ```bash
   Get-ChildItem src\pages
   ```
   Should show 5 files

4. **Verify components exist**
   ```bash
   Get-ChildItem src\components -Recurse
   ```
   Should show 5 files

---

## 🧪 Running the Application

### Terminal 1: Backend Server

```bash
cd C:\Users\Asus\Desktop\projects\VayuDrishti-Ai\backend
npm run dev
```

**Expected Output:**
```
==================================================
🚀 VayuDrishti AI Backend Server Running
📡 Port: 5000
🌍 Environment: development
⏰ Started at: [timestamp]
==================================================
```

**Verify backend is running:**
```bash
# In a new terminal
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "service": "VayuDrishti AI Backend"
}
```

### Terminal 2: Frontend Development Server

```bash
cd C:\Users\Asus\Desktop\projects\VayuDrishti-Ai\frontend
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Verify frontend is running:**
Open browser and navigate to: `http://localhost:3000`

---

## 🎯 Functional Testing

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```
✅ Should return status "OK"

### Test 2: Submit Sensor Data
```bash
curl -X POST http://localhost:5000/api/sensors/data `
  -H "Content-Type: application/json" `
  -d '{\"smoke\": 450, \"humidity\": 65}'
```
✅ Should return processed sensor data

### Test 3: Calculate AQI
```bash
curl -X POST http://localhost:5000/api/aqi/calculate `
  -H "Content-Type: application/json" `
  -d '{\"smoke\": 450, \"humidity\": 65}'
```
✅ Should return AQI value and category

### Test 4: Get Dashboard
```bash
curl http://localhost:5000/api/dashboard
```
✅ Should return complete dashboard data

### Test 5: Frontend Login
1. Open http://localhost:3000
2. Select a role (Admin/Industry/Home)
3. Click "Continue to Dashboard"

✅ Should redirect to dashboard

### Test 6: Dashboard Display
✅ AQI card should be visible
✅ Sensor panel should show data
✅ Automation panel should show status
✅ Alerts widget should be present

### Test 7: Navigation
✅ Dashboard tab should work
✅ Analytics tab should work
✅ Alerts tab should work
✅ Settings tab should work

### Test 8: Dark Mode
✅ Click moon/sun icon
✅ Theme should toggle

---

## 🐛 Troubleshooting

### Backend won't start

**Issue:** Port 5000 already in use
**Solution:**
```bash
# Edit backend\.env
# Change PORT=5000 to PORT=5001
```

**Issue:** Module not found
**Solution:**
```bash
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Frontend won't start

**Issue:** Vite errors
**Solution:**
```bash
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**Issue:** Can't connect to backend
**Solution:**
- Ensure backend is running on port 5000
- Check vite.config.js proxy settings

### CORS errors

**Issue:** CORS policy blocking requests
**Solution:**
- Ensure backend CORS is enabled (already configured)
- Start backend before frontend

---

## 📊 Success Indicators

### Backend Success ✅
- [x] Server starts on port 5000
- [x] Health endpoint responds
- [x] All API endpoints accessible
- [x] Sensor data can be submitted
- [x] AQI calculation works
- [x] Dashboard data returns correctly
- [x] Alerts can be created and retrieved

### Frontend Success ✅
- [x] Vite dev server starts
- [x] Login page loads
- [x] Role selection works
- [x] Dashboard displays
- [x] All navigation tabs work
- [x] Charts render correctly
- [x] Dark mode toggles
- [x] API integration works

---

## 🎓 For Academic Presentation

### Demonstration Checklist

- [ ] Show project structure
- [ ] Explain architecture
- [ ] Start backend server
- [ ] Start frontend application
- [ ] Login with different roles
- [ ] Show real-time dashboard
- [ ] Submit test sensor data
- [ ] Demonstrate AQI calculation
- [ ] Show automation triggering
- [ ] Display analytics charts
- [ ] Manage alerts
- [ ] Explain code structure
- [ ] Walk through key algorithms
- [ ] Show documentation

---

## 📝 Final Verification

Run this complete test:

```bash
# Test 1: Backend Health
curl http://localhost:5000/health

# Test 2: Submit Good Air Quality
curl -X POST http://localhost:5000/api/sensors/data `
  -H "Content-Type: application/json" `
  -d '{\"smoke\": 200, \"humidity\": 50}'

# Test 3: Submit Poor Air Quality (triggers automation)
curl -X POST http://localhost:5000/api/sensors/data `
  -H "Content-Type: application/json" `
  -d '{\"smoke\": 700, \"humidity\": 70}'

# Test 4: Check Dashboard (should show alerts and automation)
curl http://localhost:5000/api/dashboard

# Test 5: Get Alerts
curl http://localhost:5000/api/alerts/active
```

All commands should return valid JSON responses.

---

## 🎉 Project Ready!

If all checklists are complete:

✅ **Backend**: Fully functional  
✅ **Frontend**: Fully functional  
✅ **Integration**: Working  
✅ **Documentation**: Complete  
✅ **Testing**: Verified  

**🚀 Your VayuDrishti AI system is ready for demonstration!**

---

## 📞 Quick Reference

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Access Application:**
```
http://localhost:3000
```

**Test API:**
```bash
curl http://localhost:5000/health
```

---

**Happy Coding! 🎉**
