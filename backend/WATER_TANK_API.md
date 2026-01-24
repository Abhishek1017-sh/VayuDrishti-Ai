# Water Tank Monitoring API Documentation

## Overview
The Water Tank Monitoring API provides endpoints for managing water tank resources, monitoring water levels, and handling municipality notifications for the VayuDrishti AI system.

---

## Base URL
```
http://localhost:9000/api/water-tanks
```

---

## Endpoints

### 1. Update Water Level (Sensor Endpoint)
**POST** `/level`

Receives water level updates from ESP32 sensor devices.

**Request Body:**
```json
{
  "tankId": "TANK_001",
  "waterLevel": 75.5,
  "sensorDeviceId": "ESP32_TANK_01",
  "zone": "Zone A",
  "location": {
    "lat": 28.6139,
    "long": 77.2090
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Water level updated successfully",
  "data": {
    "tank": {
      "tankId": "TANK_001",
      "currentLevel": 75.5,
      "status": "NORMAL",
      "zone": "Zone A",
      "previousLevel": 80,
      "sprinklersDisabled": false
    },
    "alerts": [
      {
        "_id": "alert_id",
        "category": "WATER_RESOURCE",
        "subcategory": "WATER_LOW",
        "severity": "warning"
      }
    ],
    "actions": ["NOTIFY_MUNICIPALITY", "DISABLE_SPRINKLERS"]
  }
}
```

**Trigger Scenarios:**
- **Level < 40%**: Creates WATER_LOW alert (Warning)
- **Level < 20%**: Creates WATER_CRITICAL alert (Critical), disables sprinklers, notifies municipality
- **Level < 5%**: Creates WATER_EMPTY alert (Emergency), forces sprinklers OFF
- **Level > 40% (after refill)**: Creates WATER_REFILLED alert (Info), re-enables sprinklers

---

### 2. Get All Water Tanks
**GET** `/`

Retrieve list of all water tanks with optional filtering.

**Query Parameters:**
- `zone` (optional): Filter by zone
- `status` (optional): Filter by status (NORMAL, LOW, CRITICAL, EMPTY)
- `isActive` (optional): Filter by active status (true/false)

**Example:**
```bash
GET /api/water-tanks?zone=Zone%20A&status=CRITICAL
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "tankId": "TANK_001",
      "zone": "Zone A",
      "currentLevel": 15,
      "status": "CRITICAL",
      "capacity": 5000,
      "municipality": {
        "name": "Delhi Municipal Corporation",
        "contactPerson": "Rajesh Kumar",
        "email": "rajesh@dmc.gov.in",
        "phone": "+91-11-1234-5678"
      },
      "lastUpdateTime": "2026-01-24T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Tank Details
**GET** `/:tankId`

Get detailed information about a specific tank including recent alerts.

**Example:**
```bash
GET /api/water-tanks/TANK_001
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tank": {
      "tankId": "TANK_001",
      "zone": "Zone A",
      "currentLevel": 35,
      "status": "LOW",
      "capacity": 5000,
      "location": {
        "lat": 28.6139,
        "long": 77.2090
      },
      "sensorDeviceId": "ESP32_TANK_01",
      "municipality": {
        "name": "Delhi Municipal Corporation",
        "contactPerson": "Rajesh Kumar"
      }
    },
    "recentAlerts": [
      {
        "type": "Water Low",
        "severity": "warning",
        "timestamp": "2026-01-24T10:25:00Z"
      }
    ],
    "sprinklersDisabled": false
  }
}
```

---

### 4. Create Water Tank (Admin)
**POST** `/`

Create a new water tank configuration.

**Request Body:**
```json
{
  "tankId": "TANK_004",
  "zone": "Zone C",
  "location": {
    "lat": 28.7041,
    "long": 77.1025
  },
  "capacity": 8000,
  "sensorDeviceId": "ESP32_TANK_04",
  "municipality": {
    "name": "Delhi Municipal Corporation - Zone C",
    "contactPerson": "Amit Singh",
    "email": "amit@dmc.gov.in",
    "phone": "+91-11-9876-5432",
    "address": "Municipal Office, Dwarka, New Delhi"
  },
  "currentLevel": 100
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Water tank created successfully",
  "data": {
    "tankId": "TANK_004",
    "status": "NORMAL",
    "createdAt": "2026-01-24T10:30:00Z"
  }
}
```

---

### 5. Update Tank Configuration (Admin)
**PUT** `/:tankId`

Update water tank configuration (excluding currentLevel and status).

**Request Body:**
```json
{
  "municipality": {
    "contactPerson": "New Contact",
    "phone": "+91-11-1111-2222"
  },
  "capacity": 6000
}
```

---

### 6. Check Sprinkler Availability
**GET** `/:tankId/sprinkler-status`

Check if sprinklers can be activated for this tank's zone.

**Example:**
```bash
GET /api/water-tanks/TANK_001/sprinkler-status
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tankId": "TANK_001",
    "zone": "Zone A",
    "currentLevel": 15,
    "status": "CRITICAL",
    "canActivateSprinklers": false,
    "reason": "Tank status: CRITICAL (15%)"
  }
}
```

---

### 7. Municipality Refill Acknowledgment
**POST** `/:tankId/refill-acknowledge`

Municipality acknowledges water refill request.

**Request Body:**
```json
{
  "acknowledgedBy": "Rajesh Kumar",
  "responseNotes": "Water tanker dispatched. ETA 30 minutes."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Refill request acknowledged",
  "data": {
    "alertsAcknowledged": 2
  }
}
```

---

### 8. Get Tank Alerts
**GET** `/:tankId/alerts`

Get all alerts for a specific tank.

**Query Parameters:**
- `status` (optional): Filter by alert status (active, acknowledged, resolved)
- `limit` (optional): Max number of alerts to return (default: 50)

**Example:**
```bash
GET /api/water-tanks/TANK_001/alerts?status=active&limit=10
```

---

### 9. Get Tanks by Zone
**GET** `/zone/:zone`

Get all active tanks in a specific zone.

**Example:**
```bash
GET /api/water-tanks/zone/Zone%20A
```

---

## Water Level Thresholds

| Level Range | Status | Severity | Actions |
|-------------|--------|----------|---------|
| > 40% | NORMAL | - | None |
| 20-40% | LOW | Warning | Create alert |
| < 20% | CRITICAL | Critical | Disable sprinklers, Notify municipality |
| < 5% | EMPTY | Emergency | Force sprinklers OFF, Escalate alert |

---

## Alert Categories

### Water Resource Alerts
- **WATER_LOW**: Water level 20-40%
- **WATER_CRITICAL**: Water level < 20%
- **WATER_EMPTY**: Water level < 5%
- **WATER_REFILLED**: Water level recovered to > 40%
- **SPRINKLER_DISABLED_WATER**: Sprinklers disabled due to water shortage
- **SPRINKLER_REENABLED**: Sprinklers re-enabled after refill

### Municipality Alerts
- **MUNICIPALITY_NOTIFIED**: Municipality notified about water shortage

---

## Safety Features

1. **Duplicate Prevention**: No duplicate alerts for same tank within 60 minutes
2. **Sprinkler Safety**: Prevents sprinkler activation when water level is CRITICAL or EMPTY
3. **Auto-Recovery**: Automatically re-enables sprinklers when water level > 40%
4. **Auto-Acknowledgment**: Auto-acknowledges previous critical alerts after refill
5. **Zone-Based Control**: Disables all devices in affected zone

---

## Testing

### Seed Database
```bash
node backend/seed-water-tanks.js
```

### Run Simulator
```bash
chmod +x backend/test-water-tank.sh
./backend/test-water-tank.sh
```

### Manual Test
```bash
curl -X POST http://localhost:9000/api/water-tanks/level \
  -H "Content-Type: application/json" \
  -d '{
    "tankId": "TANK_001",
    "waterLevel": 15,
    "sensorDeviceId": "ESP32_TANK_01"
  }'
```

---

## Integration with Existing System

### Sprinkler Activation Check
Before activating sprinklers, the system now checks water availability:

```javascript
const waterCheck = await waterMonitorService.canActivateSprinklers(deviceId);

if (!waterCheck.allowed) {
  // Block sprinkler activation
  console.log(`Blocked: ${waterCheck.reason}`);
}
```

### Alert Panel Integration
Water alerts appear in the main alert panel with category `WATER_RESOURCE` and can be filtered separately from air quality alerts.

---

## Error Codes

- **400**: Bad Request - Invalid data
- **404**: Not Found - Tank not found
- **409**: Conflict - Tank already exists
- **500**: Internal Server Error

---

## Best Practices

1. Send water level updates every 30-60 seconds from sensors
2. Use municipality acknowledgment endpoint when refill is dispatched
3. Monitor `sprinklersDisabled` flag before attempting automation
4. Check `/sprinkler-status` endpoint before manual sprinkler activation
5. Set up alerts for CRITICAL and EMPTY status in admin dashboard

---

## Future Enhancements

- [ ] Predictive water depletion trends
- [ ] Multiple tank support per zone
- [ ] Automatic refill scheduling
- [ ] Water consumption analytics
- [ ] Integration with municipal water supply systems
