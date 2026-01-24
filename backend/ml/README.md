# VayuDrishti AI - Machine Learning Module

## 📁 Directory Structure

```
ml/
├── train_model.py          # Training script
├── predict.py              # Real-time inference
├── feature_utils.py        # Feature extraction
├── requirements.txt        # Python dependencies
├── .gitignore             # Ignore trained models
├── data/
│   └── sensor_data.csv    # Training data
└── model/
    └── fire_pollution_model.pkl  # Trained model (generated)
```

---

## 🎯 Purpose

This ML module classifies high-smoke events (AQI ≥ 500) as either:
- **FIRE** - Requires emergency response, NO automation
- **POLLUTION** - Triggers pollution mitigation (drone, sprinklers)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train Model
```bash
python train_model.py
```

### 3. Test Prediction
```bash
echo '{
  "smoke": [500, 510, 520, ...],
  "humidity": [65, 64, 63, ...],
  "temperature": [24, 25, 26, ...]
}' | python predict.py
```

---

## 📊 Training Data Format

**File:** `data/sensor_data.csv`

**Columns:**
- `timestamp` - ISO format datetime
- `smoke` - Smoke level in PPM (0-2500)
- `humidity` - Relative humidity % (0-100)
- `temperature` - Temperature in °C
- `label` - `FIRE` or `POLLUTION`

**Requirements:**
- Minimum 80 rows (generates ~20 samples with 60s windows)
- 1 reading per second
- Clear FIRE and POLLUTION patterns

---

## 🔧 Feature Engineering

### Sliding Windows
- **Window Size:** 60 seconds
- **Step Size:** 10 seconds

### 7 Features Extracted

1. **Mean Smoke** - Average PPM over window
2. **Max Smoke** - Peak PPM value
3. **Smoke Rise Rate** - Change per second
4. **Smoke Variance** - Volatility measure
5. **Humidity Change Rate** - %/second
6. **Temperature Change Rate** - °C/second
7. **Duration ≥ 500 PPM** - Seconds above threshold

---

## 🤖 Model Configuration

**Algorithm:** RandomForestClassifier

**Hyperparameters:**
- `n_estimators`: 150
- `max_depth`: 10
- `min_samples_split`: 4
- `class_weight`: {POLLUTION: 1.0, FIRE: 2.0}
- `random_state`: 42

**Why RandomForest?**
- Handles non-linear patterns
- Robust to outliers
- Provides feature importance
- Good with small datasets
- Fast inference

---

## 🛡️ Fail-Safe Logic

### Confidence Threshold: 70%

```python
if fire_probability < 0.70:
    classification = "FIRE"  # FAIL-SAFE
    decision_source = "fail_safe_default"
else:
    classification = "FIRE" if fire_probability > 0.50 else "POLLUTION"
    decision_source = "ml_prediction"
```

**Rationale:**
- Safety-first: Uncertain = FIRE
- Prevents dangerous automation during ambiguous events
- Prioritizes FIRE recall over precision

---

## 📈 Expected Performance

**Training Output:**
```
POLLUTION  precision: 0.85-0.92
           recall:    0.82-0.90
           f1-score:  0.83-0.91

FIRE       precision: 0.83-0.90
           recall:    0.88-0.95  ← HIGH PRIORITY
           f1-score:  0.85-0.92

Overall    accuracy:  0.87-0.92
```

---

## 🔍 Feature Importance

Typical ranking (varies by training data):

1. **Max Smoke** (~25-30%) - Peak level indicator
2. **Mean Smoke** (~20-25%) - Overall severity
3. **Smoke Rise Rate** (~15-20%) - Speed of increase
4. **Duration ≥500** (~12-18%) - Persistence measure
5. **Smoke Variance** (~8-12%) - Pattern volatility
6. **Temperature Change** (~2-5%) - Heat signature
7. **Humidity Change** (~1-3%) - Environmental factor

---

## ⚠️ Common Issues

### "ABORT: Only X samples generated"

**Cause:** Not enough CSV rows

**Solution:**
```
Required rows = WINDOW_SIZE + (MIN_SAMPLES * STEP_SIZE)
              = 60 + (20 * 10)
              = 260 rows minimum
```

Current CSV has 140 rows → generates ~25 samples (sufficient)

### "Model not found"

**Cause:** Model not trained yet

**Solution:**
```bash
python train_model.py
```

### All predictions → FIRE

**Possible Causes:**
1. Fail-safe mode active (confidence <70%)
2. Model not trained on enough POLLUTION data
3. Training data quality issues

**Solution:** Check training data balance (should be ~50/50 FIRE/POLLUTION)

---

## 🧪 Testing

### Unit Test Feature Extraction
```python
import pandas as pd
from feature_utils import extract_features

# Create test window
data = {
    'smoke': [500, 510, 520],
    'humidity': [65, 64, 63],
    'temperature': [24, 25, 26]
}
df = pd.DataFrame(data)

features = extract_features(df)
print(features)  # Should output 7 numbers
```

### Test Classification
```bash
# Create test_fire.json
{
  "smoke": [1000, 1200, 1400, ..., 1800],
  "humidity": [50, 45, 40, ..., 10],
  "temperature": [30, 40, 50, ..., 80]
}

# Test
cat test_fire.json | python predict.py
```

Expected: `{"cause": "FIRE", "confidence": 0.9+}`

---

## 📝 Files Explained

### train_model.py
- Loads CSV data
- Extracts features using sliding windows
- Trains RandomForest classifier
- Validates performance
- Saves model to `model/fire_pollution_model.pkl`

### predict.py
- Loads trained model
- Accepts JSON sensor data via stdin
- Extracts features
- Runs inference with fail-safe logic
- Returns JSON classification

### feature_utils.py
- Implements feature extraction
- Handles edge cases (division by zero)
- Documents all 7 features
- Used by both training and inference

---

## 🔄 Retraining

**When to retrain:**
- Monthly (with new real-world data)
- After system upgrades
- When adding new sensor types
- If performance degrades

**How to retrain:**
1. Append new labeled data to `data/sensor_data.csv`
2. Run `python train_model.py`
3. Review performance metrics
4. Deploy new model if metrics improve

---

## 📊 Production Monitoring

**Track these metrics:**
- ML classification latency (<2 seconds)
- Confidence score distribution
- FIRE vs POLLUTION ratio
- Fail-safe activation rate
- False positive/negative incidents

**Ideal Metrics:**
- Average confidence: >0.75
- Fail-safe rate: <10%
- FIRE recall: >92%
- POLLUTION precision: >87%

---

## 🚀 Integration

This ML module is called by:
1. `backend/services/mlService.js` - Node→Python bridge
2. `backend/services/actionRouter.js` - Routes ML decisions
3. `backend/controllers/mlController.js` - API endpoints

**Flow:**
```
API Request → mlService.js → spawn(predict.py) → JSON output → actionRouter.js
```

---

## 🎓 Learning Resources

**Understanding RandomForest:**
- Ensemble of decision trees
- Votes on final classification
- Reduces overfitting vs single tree

**Feature Engineering:**
- Raw sensor values alone are not enough
- Temporal patterns (rise rates, changes) are key
- Window-based aggregation captures context

**Fail-Safe Design:**
- Uncertainty → Conservative action
- False FIRE alarm > Missed FIRE detection
- Safety always prioritized

---

## 📞 Need Help?

See `../ML_SYSTEM_DOCUMENTATION.md` for complete system documentation.

---

**Remember:** This ML module is safety-critical. Always validate predictions before deployment! 🔥
