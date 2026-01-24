#!/usr/bin/env python3
"""
VayuDrishti AI - Fire vs Pollution Classifier Training

Trains a RandomForest model to distinguish FIRE from POLLUTION events.
Optimized for FIRE recall (fail-safe priority).

Requirements:
- CSV with columns: timestamp, smoke, humidity, temperature, label
- Minimum 20 training samples after windowing
- 60-second sliding windows with 10-second steps
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from feature_utils import extract_features
import joblib
import os
import sys

# ===== CONFIGURATION =====
WINDOW_SIZE = 60   # seconds (as per requirements)
STEP_SIZE = 10      # seconds (as per requirements)
MIN_SAMPLES = 20    # minimum samples required for training
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "fire_pollution_model.pkl")

print("="*60)
print("VayuDrishti AI - FIRE vs POLLUTION Classifier Training")
print("="*60)

# ===== LOAD DATA =====
print("\n[1/6] Loading sensor data...")
try:
    df = pd.read_csv("data/sensor_data.csv")
    print(f"✓ Loaded {len(df)} rows from CSV")
except FileNotFoundError:
    print("❌ Error: data/sensor_data.csv not found!")
    sys.exit(1)

# Validate required columns
required_cols = ['timestamp', 'smoke', 'humidity', 'temperature', 'label']
missing_cols = set(required_cols) - set(df.columns)
if missing_cols:
    print(f"❌ Error: Missing columns: {missing_cols}")
    sys.exit(1)

df['timestamp'] = pd.to_datetime(df['timestamp'])

# ===== FEATURE EXTRACTION =====
print("\n[2/6] Extracting features with sliding windows...")
print(f"   Window size: {WINDOW_SIZE} seconds")
print(f"   Step size: {STEP_SIZE} seconds")

X, y = [], []

for start in range(0, len(df) - WINDOW_SIZE + 1, STEP_SIZE):
    window = df.iloc[start:start+WINDOW_SIZE]
    
    # Get majority label for this window
    label = window['label'].mode()[0]
    
    # Extract 7 features
    features = extract_features(window)
    X.append(features)
    y.append(1 if label == "FIRE" else 0)

X = np.array(X)
y = np.array(y)

print(f"✓ Extracted {len(X)} samples")
print(f"   FIRE samples: {np.sum(y == 1)}")
print(f"   POLLUTION samples: {np.sum(y == 0)}")

# ===== VALIDATE SAMPLE COUNT =====
print("\n[3/6] Validating sample count...")
if len(X) < MIN_SAMPLES:
    print(f"❌ ABORT: Only {len(X)} samples generated (minimum {MIN_SAMPLES} required)")
    print(f"\n💡 Solution: Add more rows to sensor_data.csv")
    print(f"   Current CSV rows: {len(df)}")
    print(f"   Minimum CSV rows needed: ~{WINDOW_SIZE + (MIN_SAMPLES * STEP_SIZE)}")
    sys.exit(1)

print(f"✓ Sample count validation passed ({len(X)} ≥ {MIN_SAMPLES})")

# ===== TRAIN-TEST SPLIT =====
print("\n[4/6] Splitting into train/test sets...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"✓ Training samples: {len(X_train)}")
print(f"✓ Testing samples: {len(X_test)}")

# ===== TRAIN MODEL =====
print("\n[5/6] Training RandomForest model...")
print("   Optimizing for FIRE recall (fail-safe priority)")

model = RandomForestClassifier(
    n_estimators=150,
    max_depth=10,
    min_samples_split=4,
    class_weight={0: 1.0, 1: 2.0},  # Prioritize FIRE recall
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)
print("✓ Model training complete")

# ===== EVALUATE MODEL =====
print("\n[6/6] Evaluating model performance...")
y_pred = model.predict(X_test)

print("\n" + "="*60)
print("MODEL PERFORMANCE REPORT")
print("="*60)
print(classification_report(
    y_test, y_pred, 
    target_names=["POLLUTION", "FIRE"],
    digits=3
))

print("\nConfusion Matrix:")
print("                 Predicted")
print("                 POLLUTION  FIRE")
cm = confusion_matrix(y_test, y_pred)
print(f"Actual POLLUTION    {cm[0][0]:5d}     {cm[0][1]:5d}")
print(f"       FIRE         {cm[1][0]:5d}     {cm[1][1]:5d}")

# Feature importance
feature_names = [
    "Mean Smoke", "Max Smoke", "Smoke Rise Rate", 
    "Smoke Variance", "Humidity Change", "Temp Change", 
    "Duration ≥500"
]
print("\nFeature Importance:")
for name, importance in zip(feature_names, model.feature_importances_):
    print(f"  {name:20s}: {importance:.3f}")

# ===== SAVE MODEL =====
print("\n" + "="*60)
print("SAVING MODEL")
print("="*60)

# Create model directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, MODEL_PATH)
print(f"✓ Model saved to: {MODEL_PATH}")
print(f"\n🎯 Training complete! Model ready for production inference.")
print("="*60)
