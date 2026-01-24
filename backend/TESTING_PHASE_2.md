# 🧪 Water Tank Monitoring - Testing Guide

## ✅ Phase 2 Complete: API & Integration

### Files Created

1. ✅ **`backend/routes/waterTankRoutes.js`** - Complete REST API
2. ✅ **`backend/test-water-tank.sh`** - Interactive test simulator
3. ✅ **`backend/seed-water-tanks.js`** - Database seeding script
4. ✅ **`backend/WATER_TANK_API.md`** - API documentation

### Files Modified

5. ✅ **`backend/server.js`** - Registered water tank routes
6. ✅ **`backend/services/actionRouter.js`** - Added water safety checks to sprinkler activation

---

## 🚀 Quick Start Testing

### Step 1: Seed Database
```bash
cd backend
node seed-water-tanks.js
```

**Expected Output:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
🗑️  Clearing existing water tanks...
✅ Cleared
📦 Inserting sample water tanks...
✅ Inserted 3 water tanks

📋 Created Water Tanks:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️  TANK_001 (Zone A)
   📊 Level: 85% | Status: NORMAL
   📍 Location: 28.6139°N, 77.209°E
   🏛️  Municipality: Delhi Municipal Corporation - Zone A
   📱 Sensor: ESP32_TANK_01
...
```

### Step 2: Start Backend Server
```bash
npm start
# or
node server.js
```

Verify water tank routes are loaded:
```
🚀 VayuDrishti AI Backend Server Running
📡 Port: 9000
🤖 ML-Enabled: FIRE vs POLLUTION Detection
💧 Water Resource Monitoring: Enabled
```

### Step 3: Make Executable & Run Simulator
```bash
chmod +x test-water-tank.sh
./test-water-tank.sh
```

---

## 📋 Test Scenarios

### Scenario 1: Normal Operation
**Purpose:** Verify system handles normal water levels (60-100%)

**Steps:**
1. Select option `1` from menu
2. Observe 5 random water level updates
3. Verify all requests return HTTP 200
4. Confirm sprinklers remain available

**Expected Results:**
- ✅ All requests succeed
- ✅ Status: NORMAL
- ✅ Sprinklers available: YES
- ✅ No alerts created

---

### Scenario 2: Gradual Depletion
**Purpose:** Test threshold detection during slow water loss

**Steps:**
1. Select option `2` from menu
2. Watch levels drop: 80% → 65% → 50% → 38% → 25% → 15% → 8% → 3%
3. Observe alert creation at each threshold

**Expected Results:**
- ✅ NORMAL (80%, 65%, 50%) - No alerts
- ✅ LOW (38%, 25%) - Warning alert created
- ✅ CRITICAL (15%) - Critical alert, sprinklers disabled, municipality notified
- ✅ EMPTY (3%) - Emergency alert, sprinklers forced OFF

**Backend Logs to Check:**
```
[Water Monitor] Tank TANK_001: 50% → 38% (Status: LOW)
[Water Monitor] Threshold crossed: NORMAL → LOW
[Water Monitor] Alert created: Water Low for TANK_001

[Water Monitor] Tank TANK_001: 25% → 15% (Status: CRITICAL)
[Water Monitor] Threshold crossed: LOW → CRITICAL
[Water Monitor] Sprinklers disabled in Zone A (3 devices affected)
[Water Monitor] Municipality notified for tank TANK_001
```

---

### Scenario 3: Critical Alert Test
**Purpose:** Verify municipality notification and sprinkler disabling

**Steps:**
1. Select option `3` from menu
2. Level drops from 50% → 15%

**Expected Results:**
- ✅ HTTP 200 response
- ✅ Alert category: WATER_RESOURCE
- ✅ Alert subcategory: WATER_CRITICAL
- ✅ Municipality notification: YES
- ✅ Sprinklers disabled: YES

**Database Check:**
```javascript
// Check alerts collection
db.alerts.find({ 
  category: 'WATER_RESOURCE', 
  'resourceData.tankId': 'TANK_001' 
})

// Expected output:
{
  type: 'Water Critical',
  severity: 'critical',
  subcategory: 'WATER_CRITICAL',
  resourceData: {
    tankId: 'TANK_001',
    waterLevel: 15,
    previousLevel: 50,
    municipalityStatus: {
      notified: true,
      notifiedAt: ISODate("2026-01-24T...")
    },
    sprinklerStatus: {
      wasDisabled: true,
      disabledAt: ISODate("2026-01-24T...")
    }
  }
}
```

---

### Scenario 4: Empty Tank Emergency
**Purpose:** Verify emergency shutdown of all sprinklers

**Steps:**
1. Select option `4` from menu
2. Level drops to 3%

**Expected Results:**
- ✅ Alert severity: EMERGENCY (critical)
- ✅ Subcategory: WATER_EMPTY
- ✅ All pumps forced OFF in zone
- ✅ Escalated municipality notification

**Device State Check:**
```javascript
// Check device collection
db.devices.find({ zone: 'Zone A' })

// Expected output:
{
  deviceId: 'ESP32_001',
  waterRestriction: true,
  waterRestrictionReason: 'Water tank TANK_001 critical',
  relayState: {
    pump: false // FORCED OFF
  }
}
```

---

### Scenario 5: Refill & Recovery
**Purpose:** Verify sprinklers re-enable after refill

**Steps:**
1. Select option `5` from menu
2. Level rises: 5% → 25% → 50% → 85%

**Expected Results:**
- ✅ At 50% (crosses 40% threshold):
  - WATER_REFILLED alert created
  - Sprinklers re-enabled
  - Previous CRITICAL alerts auto-acknowledged
- ✅ At 85%:
  - Status: NORMAL
  - Sprinklers fully available

**Backend Logs:**
```
[Water Monitor] Tank TANK_001: 25% → 50% (Status: NORMAL)
[Water Monitor] Threshold crossed: LOW → NORMAL
[Water Monitor] Sprinklers re-enabled in Zone A (3 devices)
[Water Monitor] Auto-acknowledged 2 alerts for tank TANK_001
```

---

### Scenario 6: All Threshold Crossings
**Purpose:** Systematic testing of all transitions

**Steps:**
1. Select option `6` from menu
2. Test all transitions: NORMAL → LOW → CRITICAL → EMPTY → NORMAL

**Expected Results:**
```
100% → 35%  : NORMAL → LOW        ✅ Warning alert
35%  → 15%  : LOW → CRITICAL      ✅ Critical alert, disable sprinklers
15%  → 3%   : CRITICAL → EMPTY    ✅ Emergency alert, force OFF
3%   → 80%  : EMPTY → NORMAL      ✅ Refill alert, re-enable sprinklers
```

---

## 🔍 API Testing (Manual)

### Test 1: Update Water Level
```bash
curl -X POST http://localhost:9000/api/water-tanks/level \
  -H "Content-Type: application/json" \
  -d '{
    "tankId": "TANK_001",
    "waterLevel": 15,
    "sensorDeviceId": "ESP32_TANK_01"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Water level updated successfully",
  "data": {
    "tank": {
      "tankId": "TANK_001",
      "currentLevel": 15,
      "status": "CRITICAL",
      "sprinklersDisabled": true
    },
    "alerts": [
      {
        "type": "Water Critical",
        "severity": "critical"
      }
    ],
    "actions": ["DISABLE_SPRINKLERS", "NOTIFY_MUNICIPALITY"]
  }
}
```

### Test 2: Get Tank Status
```bash
curl http://localhost:9000/api/water-tanks/TANK_001
```

### Test 3: Check Sprinkler Availability
```bash
curl http://localhost:9000/api/water-tanks/TANK_001/sprinkler-status
```

**Expected Response (CRITICAL):**
```json
{
  "success": true,
  "data": {
    "canActivateSprinklers": false,
    "reason": "Tank status: CRITICAL (15%)"
  }
}
```

### Test 4: Municipality Acknowledgment
```bash
curl -X POST http://localhost:9000/api/water-tanks/TANK_001/refill-acknowledge \
  -H "Content-Type: application/json" \
  -d '{
    "acknowledgedBy": "Rajesh Kumar",
    "responseNotes": "Water tanker dispatched"
  }'
```

---

## 🔬 Integration Testing

### Test Sprinkler Safety in Action Router

**Scenario:** High pollution detected, sprinkler activation attempted

```bash
# 1. Set water tank to CRITICAL (< 20%)
curl -X POST http://localhost:9000/api/water-tanks/level \
  -H "Content-Type: application/json" \
  -d '{"tankId": "TANK_001", "waterLevel": 15, "sensorDeviceId": "ESP32_TANK_01"}'

# 2. Trigger pollution event (send sensor data)
curl -X POST http://localhost:9000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32_001",
    "mq": 950,
    "temperature": 28,
    "humidity": 45
  }'
```

**Expected Backend Behavior:**
```
🤖 ML Classification: POLLUTION (Confidence: 0.92)
📋 Action Router: Processing POLLUTION event
💦❌ Sprinkler activation BLOCKED for device ESP32_001: Water tank TANK_001 critical
```

**Alert Created:**
```json
{
  "type": "POLLUTION_CRITICAL",
  "automationsActivated": ["drone", "ventilation"],
  "automationBlocked": "sprinklers - water shortage"
}
```

---

## 📊 Verification Checklist

### Database Checks

**Water Tanks Collection:**
```javascript
db.watertanks.find().pretty()
```
✅ Verify 3 tanks created
✅ Check status updates correctly
✅ Verify lastUpdateTime changes

**Alerts Collection:**
```javascript
db.alerts.find({ category: 'WATER_RESOURCE' }).sort({ timestamp: -1 }).limit(5)
```
✅ Verify water alerts created
✅ Check municipality notification status
✅ Verify auto-acknowledgment works

**Devices Collection:**
```javascript
db.devices.find({ waterRestriction: true })
```
✅ Verify devices marked with water restriction
✅ Check waterRestrictionReason populated
✅ Verify pump state forced to false

---

## 🐛 Troubleshooting

### Issue: Alerts not created

**Check:**
1. Is water level crossing a threshold? (not just updating same status)
2. Check duplicate prevention (60-min window)
3. Verify MongoDB connection

**Debug:**
```javascript
// Check recent alerts
db.alerts.find({ 
  'resourceData.tankId': 'TANK_001' 
}).sort({ timestamp: -1 })
```

### Issue: Sprinklers not disabled

**Check:**
1. Devices have `zone` field set
2. Tank zone matches device zone
3. Device exists in database

**Debug:**
```javascript
// Check device zone
db.devices.find({ deviceId: 'ESP32_001' }, { zone: 1, waterRestriction: 1 })

// Check tank zone
db.watertanks.find({ tankId: 'TANK_001' }, { zone: 1 })
```

### Issue: Municipality not notified

**Check:**
1. Municipality contact info populated in tank
2. Notification service configured
3. Check backend logs for notification errors

---

## ✨ Success Criteria

**Phase 2 is successful if:**

- ✅ All API endpoints return proper responses
- ✅ Water level updates create appropriate alerts
- ✅ Sprinklers disabled when water < 20%
- ✅ Municipality notifications sent at CRITICAL
- ✅ Sprinklers re-enabled after refill
- ✅ Duplicate alerts prevented
- ✅ Action router blocks sprinkler activation during water shortage
- ✅ Test simulator runs all scenarios successfully
- ✅ No critical errors in backend logs

---

## 📈 Next: Phase 3 - Frontend Integration

Ready to proceed with:
- Water tank status widgets
- Alert panel integration (water category filters)
- Real-time water level gauges
- Municipality alert status display

**Run All Tests:**
```bash
# Seed database
node seed-water-tanks.js

# Run simulator
./test-water-tank.sh
# Select option 8 (Run All Scenarios)

# Verify results
curl http://localhost:9000/api/water-tanks
curl http://localhost:9000/api/alerts?category=WATER_RESOURCE
```

---

**Phase 2 Status: ✅ COMPLETE & READY FOR TESTING**
