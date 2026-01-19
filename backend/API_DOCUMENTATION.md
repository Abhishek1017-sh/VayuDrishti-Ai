# Backend API Documentation

## Overview

The VayuDrishti AI backend provides RESTful APIs for IoT sensor data processing, AQI calculation, automation control, and alert management.

---

## Base URL

```
http://localhost:5000/api
```

---

## API Endpoints

### Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-19T10:30:00.000Z",
  "service": "VayuDrishti AI Backend"
}
```

---

## Sensor Data APIs

### Submit Sensor Data

**POST** `/sensors/data`

Receive and process sensor data from IoT devices.

**Request Body:**
```json
{
  "smoke": 450,
  "humidity": 65,
  "location": "Building A",
  "timestamp": "2026-01-19T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "raw": {
      "smoke": 450,
      "humidity": 65
    },
    "processed": {
      "smoke": 450,
      "humidity": 65,
      "pollutionIndex": 42
    },
    "location": "Building A",
    "timestamp": "2026-01-19T10:30:00Z",
    "processedAt": "2026-01-19T10:30:01.234Z"
  },
  "message": "Sensor data received and processed"
}
```

**Error Response:**
```json
{
  "error": "Invalid sensor data",
  "details": ["Smoke value must be between 0 and 1023"]
}
```

---

### Get Latest Sensor Reading

**GET** `/sensors/latest`

Retrieve the most recent sensor data.

**Response:**
```json
{
  "success": true,
  "data": {
    "raw": {
      "smoke": 450,
      "humidity": 65
    },
    "processed": {
      "smoke": 450,
      "humidity": 65,
      "pollutionIndex": 42
    },
    "location": "Building A",
    "timestamp": "2026-01-19T10:30:00Z"
  }
}
```

---

### Get Sensor Health

**GET** `/sensors/health`

Check the health status of sensors.

**Response:**
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "message": "Sensor functioning normally",
    "lastSeen": "2026-01-19T10:30:00Z",
    "minutesSinceLastReading": 2
  }
}
```

---

## AQI APIs

### Calculate AQI

**POST** `/aqi/calculate`

Calculate Air Quality Index from sensor data.

**Request Body:**
```json
{
  "smoke": 450,
  "humidity": 65
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "value": 95,
    "category": "Moderate",
    "color": "#FFFF00",
    "healthImplications": "Acceptable air quality",
    "cautionaryStatement": "Unusually sensitive people should consider limiting prolonged outdoor exertion",
    "pollutionIndex": 42,
    "rawSmoke": 450,
    "humidity": 65,
    "timestamp": "2026-01-19T10:30:00.000Z",
    "estimated": true
  }
}
```

---

### Get Current AQI

**GET** `/aqi/current`

Get the latest AQI value.

**Response:**
```json
{
  "success": true,
  "data": {
    "value": 95,
    "category": "Moderate",
    "color": "#FFFF00",
    "timestamp": "2026-01-19T10:30:00.000Z"
  }
}
```

---

### Get AQI History

**GET** `/aqi/history?hours=24`

Retrieve AQI historical data.

**Query Parameters:**
- `hours` (optional): Number of hours to retrieve (default: 24)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": 95,
      "category": "Moderate",
      "timestamp": "2026-01-19T10:30:00.000Z"
    },
    {
      "value": 88,
      "category": "Moderate",
      "timestamp": "2026-01-19T10:00:00.000Z"
    }
  ],
  "count": 48
}
```

---

## Dashboard APIs

### Get Dashboard Data

**GET** `/dashboard`

Retrieve complete dashboard information.

**Response:**
```json
{
  "success": true,
  "data": {
    "aqi": {
      "value": 95,
      "category": "Moderate",
      "color": "#FFFF00",
      "timestamp": "2026-01-19T10:30:00.000Z",
      "estimated": true
    },
    "sensorData": {
      "smoke": 450,
      "humidity": 65,
      "pollutionIndex": 42,
      "timestamp": "2026-01-19T10:30:00.000Z"
    },
    "automation": {
      "waterSprinkling": {
        "active": false,
        "lastActivated": null,
        "onCooldown": false,
        "cooldownRemaining": 0
      },
      "ventilation": {
        "active": true,
        "lastActivated": "2026-01-19T10:25:00.000Z",
        "onCooldown": false,
        "cooldownRemaining": 0
      }
    },
    "alerts": {
      "active": [],
      "count": 0
    },
    "lastUpdated": "2026-01-19T10:30:00.000Z",
    "location": "Building A"
  }
}
```

---

### Get Analytics

**GET** `/dashboard/analytics?period=24h`

Retrieve analytics data for specified period.

**Query Parameters:**
- `period`: 24h, 7d, or 30d

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "24h",
    "dataPoints": 48,
    "average": 92,
    "peak": {
      "value": 125,
      "timestamp": "2026-01-19T08:00:00.000Z"
    },
    "trend": "stable",
    "hourlyData": [
      {
        "hour": 10,
        "average": 95,
        "count": 2
      }
    ],
    "categoryDistribution": {
      "Good": 10,
      "Moderate": 30,
      "Poor": 8,
      "Very Poor": 0
    }
  }
}
```

---

## Alert APIs

### Get All Alerts

**GET** `/alerts?status=active&limit=50`

Retrieve alerts based on filters.

**Query Parameters:**
- `status` (optional): all, active, or acknowledged
- `limit` (optional): Maximum number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_1737285000123",
      "severity": "warning",
      "message": "Poor air quality detected: AQI 105",
      "aqiValue": 105,
      "category": "Poor",
      "actions": ["ventilation", "notification"],
      "timestamp": "2026-01-19T10:30:00.000Z",
      "acknowledged": false,
      "acknowledgedBy": null,
      "acknowledgedAt": null
    }
  ],
  "count": 1
}
```

---

### Get Active Alerts

**GET** `/alerts/active`

Get only unacknowledged alerts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_1737285000123",
      "severity": "warning",
      "message": "Poor air quality detected: AQI 105",
      "acknowledged": false
    }
  ],
  "count": 1
}
```

---

### Acknowledge Alert

**POST** `/alerts/acknowledge`

Mark an alert as acknowledged.

**Request Body:**
```json
{
  "alertId": "alert_1737285000123",
  "acknowledgedBy": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert acknowledged successfully",
  "data": {
    "id": "alert_1737285000123",
    "acknowledged": true,
    "acknowledgedBy": "admin",
    "acknowledgedAt": "2026-01-19T10:35:00.000Z"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Authentication

Current version uses mock authentication. Production should implement:
- JWT tokens
- API keys for IoT devices
- Role-based access control

---

## WebSocket Support (Future)

Real-time updates will be available via WebSocket:
```javascript
const socket = io('http://localhost:5000');
socket.on('aqi-update', (data) => {
  console.log('New AQI:', data);
});
```

---

## Data Models

### Sensor Reading
```typescript
{
  raw: {
    smoke: number,        // 0-1023
    humidity: number      // 0-100
  },
  processed: {
    smoke: number,
    humidity: number,
    pollutionIndex: number  // 0-100
  },
  location: string,
  timestamp: string,
  processedAt: string
}
```

### AQI Data
```typescript
{
  value: number,          // 0-500+
  category: string,       // Good, Moderate, Poor, etc.
  color: string,          // Hex color code
  healthImplications: string,
  cautionaryStatement: string,
  timestamp: string,
  estimated: boolean
}
```

### Alert
```typescript
{
  id: string,
  severity: 'critical' | 'warning' | 'info',
  message: string,
  aqiValue?: number,
  category?: string,
  actions?: string[],
  timestamp: string,
  acknowledged: boolean,
  acknowledgedBy?: string,
  acknowledgedAt?: string
}
```

---

## Testing Examples

### Using cURL

```bash
# Submit sensor data
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 450, "humidity": 65, "location": "Test Lab"}'

# Calculate AQI
curl -X POST http://localhost:5000/api/aqi/calculate \
  -H "Content-Type: application/json" \
  -d '{"smoke": 450, "humidity": 65}'

# Get dashboard
curl http://localhost:5000/api/dashboard

# Get alerts
curl http://localhost:5000/api/alerts?status=active
```

### Using JavaScript (fetch)

```javascript
// Submit sensor data
const response = await fetch('http://localhost:5000/api/sensors/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    smoke: 450,
    humidity: 65,
    location: 'Building A'
  })
});
const data = await response.json();
```

---

## Support

For API issues or questions, refer to the main README.md or contact the development team.
