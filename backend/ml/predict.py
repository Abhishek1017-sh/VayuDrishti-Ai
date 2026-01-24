#!/usr/bin/env python3
"""
VayuDrishti AI - Real-time FIRE vs POLLUTION Classifier

Fail-safe inference logic:
- Run ONLY when AQI >= 500
- If FIRE probability < 70% -> classify as FIRE (fail-safe)
- Returns cause, confidence, and decision source

Safety-first design prevents dangerous automation during uncertain conditions.
"""

import joblib
import pandas as pd
import numpy as np
import sys
import json
import os
from feature_utils import extract_features

# ===== CONFIGURATION =====
FIRE_CONFIDENCE_THRESHOLD = 0.70  # 70% as per requirements
MODEL_PATH = "model/fire_pollution_model.pkl"
AQI_THRESHOLD = 500  # Only run ML when AQI >= 500

class FirePollutionClassifier:
    """
    Production classifier with fail-safe logic.
    """
    
    def __init__(self):
        """Load the trained model."""
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                f"Please run train_model.py first."
            )
        
        self.model = joblib.load(MODEL_PATH)
    
    def classify_event(self, sensor_data):
        """
        Classify FIRE vs POLLUTION with fail-safe logic.
        
        Args:
            sensor_data: dict or DataFrame with keys/columns:
                - smoke (array or list)
                - humidity (array or list)
                - temperature (array or list)
                Must contain 60 seconds of data (1 reading/second)
        
        Returns:
            dict: {
                'cause': 'FIRE' or 'POLLUTION',
                'confidence': float (0-1),
                'fire_probability': float (0-1),
                'pollution_probability': float (0-1),
                'decision_source': 'ml_prediction' or 'fail_safe_default',
                'threshold_used': float
            }
        """
        
        # Convert to DataFrame if dict
        if isinstance(sensor_data, dict):
            window_df = pd.DataFrame(sensor_data)
        else:
            window_df = sensor_data
        
        # Validate required columns
        required_cols = ['smoke', 'humidity', 'temperature']
        for col in required_cols:
            if col not in window_df.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Validate minimum data points
        if len(window_df) < 60:
            raise ValueError(
                f"Insufficient data: {len(window_df)} readings "
                f"(minimum 60 required for 60-second window)"
            )
        
        # Extract features
        features = extract_features(window_df)
        
        # Get prediction probabilities
        # prob[0] = POLLUTION probability
        # prob[1] = FIRE probability
        prob = self.model.predict_proba([features])[0]
        
        pollution_prob = prob[0]
        fire_prob = prob[1]
        
        # ===== FAIL-SAFE LOGIC =====
        # If FIRE probability < 70%, default to FIRE (safety-first)
        if fire_prob < FIRE_CONFIDENCE_THRESHOLD:
            cause = "FIRE"
            confidence = fire_prob
            decision_source = "fail_safe_default"
        else:
            # High confidence prediction
            if fire_prob > 0.5:
                cause = "FIRE"
                confidence = fire_prob
            else:
                cause = "POLLUTION"
                confidence = pollution_prob
            decision_source = "ml_prediction"
        
        return {
            'cause': cause,
            'confidence': float(confidence),
            'fire_probability': float(fire_prob),
            'pollution_probability': float(pollution_prob),
            'decision_source': decision_source,
            'threshold_used': FIRE_CONFIDENCE_THRESHOLD
        }
    
    def check_aqi_threshold(self, aqi):
        """
        Check if ML should be triggered based on AQI.
        
        Args:
            aqi: float, current Air Quality Index
        
        Returns:
            bool: True if ML should run (AQI >= 500)
        """
        return aqi >= AQI_THRESHOLD


def main():
    """
    CLI interface for testing.
    
    Usage:
        python predict.py < sensor_data.json
        
    JSON format:
        {
            "smoke": [500, 505, 510, ...],  # 60 readings
            "humidity": [65, 64, 63, ...],
            "temperature": [24.0, 24.5, ...]
        }
    """
    
    try:
        # Read JSON from stdin
        input_data = json.load(sys.stdin)
        
        # Initialize classifier
        classifier = FirePollutionClassifier()
        
        # Check AQI threshold (if provided)
        if 'aqi' in input_data:
            aqi = input_data['aqi']
            if not classifier.check_aqi_threshold(aqi):
                print(json.dumps({
                    'error': False,
                    'message': f'AQI {aqi} below threshold {AQI_THRESHOLD}. ML not triggered.',
                    'should_run_ml': False
                }))
                sys.exit(0)
        
        # Classify event
        result = classifier.classify_event(input_data)
        
        # Output result as JSON
        result['error'] = False
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError:
        print(json.dumps({
            'error': True,
            'message': 'Invalid JSON input'
        }))
        sys.exit(1)
    
    except FileNotFoundError as e:
        print(json.dumps({
            'error': True,
            'message': str(e)
        }))
        sys.exit(1)
    
    except ValueError as e:
        print(json.dumps({
            'error': True,
            'message': str(e)
        }))
        sys.exit(1)
    
    except Exception as e:
        print(json.dumps({
            'error': True,
            'message': f'Unexpected error: {str(e)}'
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
