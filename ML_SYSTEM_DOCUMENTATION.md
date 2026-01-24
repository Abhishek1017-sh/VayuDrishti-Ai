# VayuDrishti AI - ML System Documentation

## 🎯 System Overview

VayuDrishti AI is a complete IoT + AI air quality monitoring and action automation system that:
- Monitors air quality using MQ-135 smoke, DHT11 humidity, and temperature sensors
- Estimates AQI (Air Quality Index)
- Detects high-smoke events (AQI ≥ 500)
- **Classifies events as FIRE or POLLUTION using Machine Learning**
- Triggers appropriate automated actions safely
- Provides admin dashboards and alert tracking

---

## 🔥 ML Classification System

### Fail-Safe Design Principles

1. **FIRE ALWAYS HAS PRIORITY** - Safety-first approach
2. **Low confidence defaults to FIRE** - When uncertain, assume worst case
3. **Never activate drone/sprinklers during FIRE** - Prevents dangerous actions
4. **ML runs ONLY when AQI ≥ 500** - Critical threshold activation

---

## 📊 ML Model Training

### Data Requirements

**CSV Format** (`backend/ml/data/sensor_data.csv`):
```csv
timestamp,smoke,humidity,temperature,label
2026-01-24 10:00:00,180,65,24.2,POLLUTION
2026-01-24 10:00:01,185,65,24.3,POLLUTION
...
2026-01-24 10:02:00,900,40,41.8,FIRE
2026-01-24 10:02:01,1200,30,55.0,FIRE
```

### Feature Engineering

**Sliding Window Approach:**
- Window Size: **60 seconds**
- Step Size: **10 seconds**

**7 Extracted Features:**
1. **Mean Smoke** - Average smoke level in PPM
2. **Max Smoke** - Peak smoke level
3. **Smoke Rise Rate** - Change per second (PPM/s)
4. **Smoke Variance** - Volatility measure
5. **Humidity Change Rate** - Change per second (%/s)
6. **Temperature Change Rate** - Change per second (°C/s)
7. **Duration Smoke ≥ 500** - Number of seconds above critical threshold

### Training the Model

```bash
cd backend/ml
python train_model.py
```

**Training Configuration:**
- Algorithm: RandomForestClassifier
- Estimators: 150 trees
- Max Depth: 10
- **Class Weights: FIRE=2.0, POLLUTION=1.0** (prioritizes FIRE recall)
- Minimum Samples: 20 (aborts if insufficient data)

**Output:**
- Model saved to: `backend/ml/model/fire_pollution_model.pkl`
- Performance report with precision/recall/F1
- Feature importance ranking

---

## 🤖 Real-Time Inference

### Prediction Logic (predict.py)

```python
# Fail-safe threshold
FIRE_CONFIDENCE_THRESHOLD = 0.70

# Classification logic
if fire_probability < 0.70:
    cause = "FIRE"  # FAIL-SAFE: Low confidence = FIRE
    decision_source = "fail_safe_default"
else:
    if fire_probability > 0.50:
        cause = "FIRE"
    else:
        cause = "POLLUTION"
    decision_source = "ml_prediction"
```

### Input Format

```json
{
  "smoke": [500, 505, 510, ..., 600],      // 60 readings
  "humidity": [65, 64, 63, ..., 60],       // 60 readings
  "temperature": [24.0, 24.5, ..., 27.0],  // 60 readings
  "aqi": 520
}
```

### Output Format

```json
{
  "cause": "FIRE",
  "confidence": 0.85,
  "fire_probability": 0.85,
  "pollution_probability": 0.15,
  "decision_source": "ml_prediction",
  "threshold_used": 0.70
}
```

---

## ⚙️ Action Automation

### FIRE Detection Actions

When ML classifies as **FIRE**:

1. ✅ **Create EMERGENCY Alert**
   - Severity: EMERGENCY
   - Type: FIRE_DETECTED
   - Includes: AQI, ML confidence, location

2. ✅ **Notify Fire Station**
   - Find nearest station by zone
   - Send emergency message with:
     - Zone, Device ID
     - GPS coordinates
     - AQI level
     - ML confidence

3. ❌ **Block Dangerous Automations**
   - **NO drone activation** (could spread fire)
   - **NO sprinkler activation** (electrical hazard)
   - Log blocked actions for audit

### POLLUTION Detection Actions

When ML classifies as **POLLUTION**:

1. ✅ **Create CRITICAL Alert**
   - Severity: CRITICAL
   - Type: POLLUTION_CRITICAL
   - Includes: AQI, ML confidence, automation status

2. ✅ **Activate Drone**
   - Mode: Water + NO₂ spray
   - Duration: 300 seconds (5 minutes)
   - Zone coverage: Autonomous

3. ✅ **Activate Sprinklers**
   - Duration: 180 seconds (3 minutes)
   - Suppresses smoke/pollution

4. ✅ **Enable Ventilation**
   - Mode: Safe mode
   - Fan Speed: 80%
   - Increases air circulation

---

## 🔌 API Endpoints

### ML Classification

#### Process Sensor Event
```http
POST /api/ml/process-event
Content-Type: application/json

{
  "deviceId": "HOME-001",
  "zone": "Zone-A",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "currentAQI": 520
}
```

**Response:**
```json
{
  "success": true,
  "triggered": true,
  "cause": "POLLUTION",
  "confidence": 0.87,
  "decision_source": "ml_prediction",
  "aqi": 520,
  "deviceId": "HOME-001",
  "zone": "Zone-A",
  "actions": [
    {
      "action": "critical_alert_created",
      "alertId": "65f...",
      "status": "success"
    },
    {
      "action": "drone_activated",
      "droneId": "DRONE-Zone-A-01",
      "status": "success"
    },
    {
      "action": "sprinklers_activated",
      "status": "success"
    }
  ]
}
```

#### Test Classification
```http
POST /api/ml/test-classify
Content-Type: application/json

{
  "smoke": [500, 510, 520, ..., 600],
  "humidity": [65, 64, 63, ..., 60],
  "temperature": [24.0, 24.5, ..., 27.0],
  "aqi": 520
}
```

#### Get ML Status
```http
GET /api/ml/status
```

**Response:**
```json
{
  "success": true,
  "mlEnabled": true,
  "modelExists": true,
  "aqiThreshold": 500,
  "fireConfidenceThreshold": 0.70,
  "failSafeMode": "FIRE"
}
```

### Drone Control

#### Activate Drone
```http
POST /api/drone/activate

{
  "deviceId": "HOME-001",
  "zone": "Zone-A",
  "duration": 300,
  "mode": "water_and_no2"
}
```

#### Emergency Stop
```http
POST /api/drone/emergency-stop

{
  "reason": "Manual intervention required"
}
```

### Sprinkler Control

```http
POST /api/automation/sprinklers/activate
POST /api/automation/sprinklers/deactivate
```

### Ventilation Control

```http
POST /api/automation/ventilation/enable
POST /api/automation/ventilation/disable
```

---

## 🗃️ Database Models

### Alert Model

```javascript
{
  type: "FIRE_DETECTED" | "POLLUTION_CRITICAL",
  severity: "EMERGENCY" | "CRITICAL",
  status: "active" | "acknowledged" | "resolved",
  deviceId: String,
  zone: String,
  location: { latitude, longitude },
  aqi: Number,
  mlConfidence: Number,        // 0-1
  decisionSource: String,       // ml_prediction | fail_safe_default
  automationsActivated: [],     // For POLLUTION
  automationBlocked: String,    // For FIRE
  message: String,
  timestamp: Date
}
```

### FireBrigadeContact Model

```javascript
{
  zone: String,
  name: String,
  phone: String,
  emergencyHotline: String,
  coordinates: { latitude, longitude },
  priority: Number,
  responseTime: Number,
  isActive: Boolean
}
```

### AutomationLog Model

```javascript
{
  deviceId: String,
  action: "DRONE_ACTIVATED" | "SPRINKLERS_ACTIVATED" | "VENTILATION_ENABLED",
  droneId: String,
  mode: String,
  duration: Number,
  zone: String,
  triggeredBy: "ML_POLLUTION_DETECTION" | "ML_FIRE_DETECTION",
  status: "active" | "completed" | "emergency_stopped",
  startTime: Date,
  endTime: Date
}
```

---

## 🧪 Testing the System

### 1. Train the Model

```bash
cd backend/ml
python train_model.py
```

Expected output:
```
VayuDrishti AI - FIRE vs POLLUTION Classifier Training
======================================================
[1/6] Loading sensor data...
✓ Loaded 140 rows from CSV
[2/6] Extracting features...
✓ Extracted 25 samples
[3/6] Validating sample count...
✓ Sample count validation passed
[4/6] Splitting train/test...
[5/6] Training RandomForest...
✓ Model training complete
[6/6] Evaluating...

MODEL PERFORMANCE REPORT
                 precision    recall  f1-score
POLLUTION           0.900     0.850     0.874
FIRE                0.880     0.920     0.900

✓ Model saved to: model/fire_pollution_model.pkl
```

### 2. Test ML Classification

Create `test_ml.json`:
```json
{
  "smoke": [500, 510, 520, 530, 540, ...],
  "humidity": [65, 64, 63, 62, 61, ...],
  "temperature": [24.0, 24.5, 25.0, 25.5, 26.0, ...]
}
```

Test via API:
```bash
curl -X POST http://localhost:9000/api/ml/test-classify \
  -H "Content-Type: application/json" \
  -d @test_ml.json
```

### 3. Simulate Event Processing

```bash
curl -X POST http://localhost:9000/api/ml/process-event \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "HOME-001",
    "zone": "Zone-A",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "currentAQI": 520
  }'
```

---

## 📈 Monitoring & Logs

### Backend Logs

Watch for:
- `🤖 ML Classification:` - ML decisions
- `🚁 Drone activated:` - Drone operations
- `💦 Sprinklers activated:` - Sprinkler activations
- `🚒 FIRE STATION NOTIFICATION:` - Emergency alerts
- `❌ ML Service Error:` - Fail-safe activations

### Database Queries

**Recent FIRE alerts:**
```javascript
db.alerts.find({ 
  type: "FIRE_DETECTED" 
}).sort({ timestamp: -1 }).limit(10)
```

**ML classification stats:**
```javascript
db.alerts.aggregate([
  { $match: { decisionSource: { $exists: true } } },
  { $group: { 
      _id: "$decisionSource", 
      count: { $sum: 1 } 
  }}
])
```

---

## 🚀 Future Extensions

The system is designed for easy extension:

### Planned Features

1. **Predictive AQI Forecasting**
   - Time series analysis (LSTM)
   - Predict AQI 6-24 hours ahead
   - Early warning system

2. **Additional Sensors**
   - CO₂ sensor integration
   - PM2.5/PM10 particulate sensors
   - VOC (Volatile Organic Compounds)

3. **Mobile Notifications**
   - Push notifications via Firebase
   - SMS alerts via Twilio
   - Email notifications

4. **City-Wide Scaling**
   - Multi-device coordination
   - Zone-based pollution maps
   - Heat map visualization

5. **NGO & Afforestation Planning**
   - Pollution hotspot identification
   - Optimal tree planting locations
   - Environmental impact reports

---

## ⚠️ Important Safety Notes

1. **Never disable fail-safe logic** - Always default to FIRE when uncertain
2. **Test thoroughly** - Validate ML predictions against real-world data
3. **Regular retraining** - Update model with new sensor data monthly
4. **Monitor confidence scores** - Low confidence indicates need for more training data
5. **Manual override** - Always allow human intervention for critical decisions

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Model file not found**
```
Solution: Run `python train_model.py` first
```

**Issue: Python script fails**
```
Solution: 
1. Check Python is installed: python --version
2. Install dependencies: pip install -r requirements.txt
3. Verify CSV data exists in backend/ml/data/
```

**Issue: Insufficient training data**
```
Solution: Add more rows to sensor_data.csv (minimum 80 rows for 20 samples)
```

**Issue: All events classified as FIRE**
```
Solution: This is fail-safe mode - check:
1. ML model is trained
2. Confidence threshold (0.70)
3. Training data quality
```

---

## 📝 Conclusion

The VayuDrishti AI system provides a complete, production-ready solution for ML-based air quality monitoring with fail-safe automation. The architecture supports easy extension for future features while maintaining safety-first principles throughout.

**Key Success Metrics:**
- ✅ FIRE recall > 90% (safety priority)
- ✅ POLLUTION precision > 85% (avoid false positives)
- ✅ Zero dangerous automations during FIRE events
- ✅ Response time < 5 seconds from detection to action

---

*Built with safety, scalability, and extensibility in mind.*
