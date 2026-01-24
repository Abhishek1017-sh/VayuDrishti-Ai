import numpy as np

def extract_features(window):
    """
    Extract 7 critical features from sensor window for FIRE vs POLLUTION classification.
    
    Features:
    1. Mean smoke (PPM)
    2. Max smoke (PPM)
    3. Smoke rise rate (PPM/second)
    4. Smoke variance
    5. Humidity change rate (%/second)
    6. Temperature change rate (°C/second)
    7. Duration smoke ≥ 500 (seconds)
    
    Args:
        window: DataFrame with columns [smoke, humidity, temperature]
        
    Returns:
        list: 7 features for ML model
    """
    smoke = window['smoke'].values
    humidity = window['humidity'].values
    temperature = window['temperature'].values
    
    # Prevent division by zero
    duration_seconds = len(smoke)
    if duration_seconds < 2:
        duration_seconds = 2
    
    # Feature 1: Mean smoke level
    mean_smoke = np.mean(smoke)
    
    # Feature 2: Max smoke level
    max_smoke = np.max(smoke)
    
    # Feature 3: Smoke rise rate (change per second)
    smoke_rise_rate = (smoke[-1] - smoke[0]) / duration_seconds
    
    # Feature 4: Smoke variance (volatility)
    smoke_variance = np.var(smoke)
    
    # Feature 5: Humidity change rate (per second)
    humidity_change_rate = (humidity[-1] - humidity[0]) / duration_seconds
    
    # Feature 6: Temperature change rate (per second)
    temperature_change_rate = (temperature[-1] - temperature[0]) / duration_seconds
    
    # Feature 7: Duration smoke ≥ 500 PPM (critical threshold)
    duration_high_smoke = np.sum(smoke >= 500)
    
    features = [
        mean_smoke,
        max_smoke,
        smoke_rise_rate,
        smoke_variance,
        humidity_change_rate,
        temperature_change_rate,
        duration_high_smoke
    ]
    
    return features
