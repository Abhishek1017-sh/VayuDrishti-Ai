# VayuDrishti AI - Technical Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Analytics │  │  Alerts  │  │ Settings │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴─────────────┘           │
│                       │                                      │
│                  ┌────▼────┐                                │
│                  │API Layer│                                │
│                  └────┬────┘                                │
└───────────────────────┼─────────────────────────────────────┘
                        │ HTTP/REST
┌───────────────────────▼─────────────────────────────────────┐
│                     Backend API                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Routes   │  │Controllers│ │ Services │  │  Utils   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴─────────────┘           │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │  Data Store     │                            │
│              │  (In-Memory)    │                            │
│              └─────────────────┘                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ (Future: MQTT/WebSocket)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    IoT Sensors                               │
│  ┌──────────────┐           ┌──────────────┐               │
│  │ Smoke Sensor │           │Humidity Sensor│               │
│  └──────────────┘           └──────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Sensor Data Ingestion

```
IoT Device
    │
    ├─► POST /api/sensors/data
    │       │
    │       ├─► Validation
    │       │       │
    │       │       ├─► Valid? ─────► Clean Data
    │       │       │                     │
    │       │       └─► Invalid? ─────► Error Response
    │       │
    │       └─► Store Raw + Processed Data
    │
    └─► Response with Processed Data
```

### 2. AQI Calculation Pipeline

```
Sensor Data
    │
    ├─► Normalize Smoke Value (0-1023 → 0-100)
    │       │
    │       └─► Apply Non-linear Curve
    │
    ├─► Apply Humidity Correction
    │       │
    │       ├─► High Humidity (>70%) → 0.85x
    │       ├─► Medium Humidity (50-70%) → 0.95x
    │       └─► Low Humidity (<50%) → 1.0x
    │
    ├─► Map to AQI Range
    │       │
    │       ├─► 0-20 PI → 0-50 AQI (Good)
    │       ├─► 21-40 PI → 51-100 AQI (Moderate)
    │       ├─► 41-60 PI → 101-150 AQI (Poor)
    │       ├─► 61-80 PI → 151-200 AQI (Very Poor)
    │       └─► 81-100 PI → 201-300 AQI (Severe)
    │
    └─► Assign Category & Health Info
```

### 3. Automation Workflow

```
AQI Value
    │
    ├─► Check Thresholds
    │       │
    │       ├─► AQI >= 150 (Critical)
    │       │       │
    │       │       ├─► Create Critical Alert
    │       │       ├─► Activate Water Sprinkling
    │       │       │       │
    │       │       │       ├─► Check Cooldown
    │       │       │       ├─► Apply Safety Delay (5s)
    │       │       │       └─► Execute Action
    │       │       │
    │       │       └─► Activate Ventilation
    │       │
    │       └─► AQI >= 100 (Alert)
    │               │
    │               ├─► Create Warning Alert
    │               └─► Activate Ventilation Only
    │
    └─► Update Automation Status
```

## Component Architecture

### Backend Components

```
backend/
│
├── server.js                 # Express app initialization
│
├── routes/                   # API route definitions
│   ├── sensorRoutes.js      # /api/sensors/*
│   ├── aqiRoutes.js         # /api/aqi/*
│   ├── dashboardRoutes.js   # /api/dashboard/*
│   └── alertRoutes.js       # /api/alerts/*
│
├── controllers/              # Request handlers
│   ├── sensorController.js  # Sensor data logic
│   ├── aqiController.js     # AQI calculation logic
│   ├── dashboardController.js # Dashboard aggregation
│   └── alertController.js   # Alert management
│
├── services/                 # Core business logic
│   ├── sensorService.js     # Data cleaning & normalization
│   ├── aqiService.js        # AQI estimation algorithms
│   └── automationService.js # Automation triggers
│
└── utils/                    # Helper utilities
    └── dataStore.js         # In-memory data storage
```

### Frontend Components

```
frontend/
│
├── src/
│   ├── main.jsx             # App entry point
│   ├── App.jsx              # Main app component
│   │
│   ├── pages/               # Page components
│   │   ├── Login.jsx        # Authentication page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Analytics.jsx    # Analytics page
│   │   ├── Alerts.jsx       # Alerts management
│   │   └── Settings.jsx     # Settings page
│   │
│   ├── components/          # Reusable components
│   │   ├── Layout.jsx       # App layout wrapper
│   │   └── dashboard/       # Dashboard-specific components
│   │       ├── AQICard.jsx
│   │       ├── SensorPanel.jsx
│   │       ├── AutomationPanel.jsx
│   │       └── AlertsWidget.jsx
│   │
│   └── services/            # API integration
│       └── api.js           # API client & endpoints
```

## State Management

### Backend State

```javascript
// In-memory storage (production: use database)
{
  sensorReadings: [
    {
      raw: { smoke, humidity },
      processed: { smoke, humidity, pollutionIndex },
      location,
      timestamp
    }
  ],
  aqiReadings: [
    {
      value,
      category,
      color,
      timestamp
    }
  ],
  alerts: [
    {
      id,
      severity,
      message,
      acknowledged
    }
  ],
  automationState: {
    waterSprinkling: { active, cooldownUntil },
    ventilation: { active, cooldownUntil }
  }
}
```

### Frontend State

```javascript
// React component state
{
  dashboardData: {
    aqi: { value, category, color },
    sensorData: { smoke, humidity, pollutionIndex },
    automation: { waterSprinkling, ventilation },
    alerts: { active, count }
  },
  analyticsData: {
    average,
    peak,
    trend,
    hourlyData,
    categoryDistribution
  },
  loading: boolean,
  error: string | null
}
```

## Security Considerations

### Current Implementation

- ✅ Input validation
- ✅ CORS enabled
- ✅ Environment variables
- ✅ Error handling

### Production Recommendations

- 🔒 JWT authentication
- 🔒 API key management
- 🔒 Rate limiting
- 🔒 HTTPS enforcement
- 🔒 SQL injection prevention (when using DB)
- 🔒 XSS protection
- 🔒 CSRF tokens

## Performance Optimization

### Backend

- In-memory storage for fast access
- Efficient data structures
- Minimal processing overhead
- Response time: < 50ms

### Frontend

- React.memo for component optimization
- Lazy loading for routes
- Debounced API calls
- Optimized re-renders
- CSS animations (GPU accelerated)

## Scalability

### Horizontal Scaling

```
Load Balancer
    │
    ├─► Backend Server 1 ──┐
    ├─► Backend Server 2 ──┼─► Shared Database
    └─► Backend Server 3 ──┘         │
                                     └─► Redis Cache
```

### Database Integration

```
Current: In-Memory Arrays
    │
    └─► Production Options:
        ├─► MongoDB (Document DB)
        ├─► PostgreSQL (Relational)
        └─► TimescaleDB (Time-series)
```

## Monitoring & Logging

### Recommended Tools

- **Application Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Logging**: Winston, Morgan
- **Metrics**: Prometheus + Grafana

### Key Metrics

- API response time
- Sensor data ingestion rate
- AQI calculation latency
- Alert generation frequency
- System uptime

## Deployment Architecture

### Development

```
localhost:3000 (Frontend) ──► localhost:5000 (Backend)
```

### Production

```
users
  │
  └─► CDN (Static Assets)
  │
  └─► Web Server (Frontend)
          │
          └─► API Gateway
                  │
                  └─► Backend Servers
                          │
                          ├─► Database
                          ├─► Cache
                          └─► Message Queue
```

## Technology Choices

### Why Node.js + Express?

- Fast I/O operations
- Real-time capabilities
- Large ecosystem
- Easy integration with IoT protocols

### Why React?

- Component reusability
- Virtual DOM performance
- Rich ecosystem
- Easy state management

### Why Tailwind CSS?

- Rapid development
- Consistent styling
- Small bundle size
- Dark mode support

### Why Framer Motion?

- Smooth animations
- Declarative API
- Performance optimized
- Easy to learn

## Future Enhancements

1. **Real-time Updates**: WebSocket integration
2. **Machine Learning**: AQI prediction models
3. **Mobile Apps**: React Native
4. **Advanced Analytics**: Custom dashboards
5. **Multi-tenant**: Support multiple locations
6. **Export Features**: PDF/CSV reports
7. **Notifications**: Email/SMS alerts
8. **IoT Integration**: MQTT protocol support

---

**Architecture designed for academic demonstration and future production scalability**
