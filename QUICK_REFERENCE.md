# 🚀 VayuDrishti - Quick Reference Card

## 1-Minute Start

```bash
# Windows
quick-test.bat

# Manual
cd backend && node seed-water-tanks.js && npm start
cd frontend && npm run dev
```

---

## Key Endpoints

```bash
# Water Tanks
GET    /api/water-tanks
POST   /api/water-tanks/level

# Alerts  
GET    /api/alerts
GET    /api/alerts?category=WATER_RESOURCE

# Sensors
POST   /api/sensors
```

---

## Water Thresholds

| Level | Status | Color | Action |
|-------|--------|-------|--------|
| >40% | NORMAL | 🟢 | Available |
| 20-40% | LOW | 🟡 | Warning |
| 5-20% | CRITICAL | 🟠 | Disable sprinklers |
| <5% | EMPTY | 🔴 | Force OFF |

---

## Test Scenarios

```bash
cd backend
bash test-water-tank.sh

1. Normal (60-100%)
2. Gradual Depletion (80% → 3%)
3. Critical (50% → 15%)
4. Empty (3%)
5. Refill (5% → 85%)
6. All Thresholds
```

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/models/WaterTank.js` | Tank schema |
| `backend/services/waterMonitorService.js` | Core logic |
| `backend/routes/waterTankRoutes.js` | API routes |
| `frontend/src/components/WaterTank/WaterTankWidget.jsx` | UI widget |
| `frontend/src/services/api.js` | API client |

---

## Common Commands

```bash
# Seed database
node backend/seed-water-tanks.js

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Test API
curl http://localhost:9000/api/water-tanks

# Update water level
curl -X POST http://localhost:9000/api/water-tanks/level \
  -H "Content-Type: application/json" \
  -d '{"tankId":"TANK_001","waterLevel":15,"sensorDeviceId":"ESP32_TANK_01"}'
```

---

## Frontend Features

- **Water Tanks Overview:** Admin Alerts → Top section
- **Category Filter:** "Water Resource" option
- **Alert Cards:** Water level gauge + municipality status
- **Auto-refresh:** Every 30 seconds
- **Manual Refresh:** 🔄 button

---

## Documentation

- **Main:** [README.md](README.md)
- **Complete:** [COMPLETE_IMPLEMENTATION_SUMMARY.md](COMPLETE_IMPLEMENTATION_SUMMARY.md)
- **Testing:** [PHASE_4_TESTING_GUIDE.md](PHASE_4_TESTING_GUIDE.md)
- **API:** [backend/WATER_TANK_API.md](backend/WATER_TANK_API.md)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API fails | Check MongoDB running |
| Frontend blank | Check backend on port 9000 |
| No water tanks | Run seed script |
| Alerts not showing | Check category filter |
| Refresh not working | Check browser console |

---

## Environment

```env
# Backend (.env)
PORT=9000
MONGODB_URI=mongodb://localhost:27017/vayudrishti
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:9000/api
```

---

## Status Indicators

### Water Tank Widget:
- **Green bar + ✅:** Normal (>40%)
- **Yellow bar + ⚠️:** Low (20-40%)
- **Orange bar + 🚨:** Critical (5-20%)
- **Red bar + ❌:** Empty (<5%)

### Sprinklers:
- **💦 Available:** Water >20%
- **🚫 Disabled:** Water <20%

---

## Quick Debug

```bash
# Check backend health
curl http://localhost:9000/api/water-tanks

# Check frontend API calls
# Open browser console → Network tab

# View backend logs
# Check terminal running npm start

# Test simulator
cd backend
bash test-water-tank.sh
# Select option 2 (Gradual Depletion)
```

---

## Production URLs

- Frontend: https://vayudrishti.app *(placeholder)*
- Backend: https://api.vayudrishti.app *(placeholder)*
- Docs: https://docs.vayudrishti.app *(placeholder)*

---

**Version:** 2.0.0 | **Updated:** Jan 24, 2026 | **Status:** ✅ Production Ready
