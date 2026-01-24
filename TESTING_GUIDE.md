# Sample IoT Data for Testing

## Test Scenarios

### Scenario 1: Good Air Quality
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{
    "smoke": 150,
    "humidity": 45,
    "location": "Office Building",
    "timestamp": "2026-01-19T10:00:00Z"
  }'
```
Expected: AQI ~35 (Good), No alerts, No automation

---

### Scenario 2: Moderate Air Quality
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{
    "smoke": 400,
    "humidity": 60,
    "location": "Factory Area",
    "timestamp": "2026-01-19T11:00:00Z"
  }'
```
Expected: AQI ~85 (Moderate), No alerts, No automation

---

### Scenario 3: Poor Air Quality (Warning Level)
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{
    "smoke": 600,
    "humidity": 70,
    "location": "Industrial Zone",
    "timestamp": "2026-01-19T12:00:00Z"
  }'
```
Expected: AQI ~115 (Poor), Warning alert, Ventilation ON

---

### Scenario 4: Very Poor Air Quality (Critical Level)
```bash
curl -X POST http://localhost:9000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{
    "smoke": 850,
    "humidity": 75,
    "location": "High Risk Area",
    "timestamp": "2026-01-19T13:00:00Z"
  }'
```
Expected: AQI ~175 (Very Poor), Critical alert, Water Sprinkling + Ventilation ON

---

### Scenario 5: Hazardous Air Quality
```bash
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{
    "smoke": 980,
    "humidity": 80,
    "location": "Emergency Area",
    "timestamp": "2026-01-19T14:00:00Z"
  }'
```
Expected: AQI ~220 (Severe), Multiple critical alerts, All systems active

---

## Batch Testing Script

Create a file `test-scenarios.sh`:

```bash
#!/bin/bash

echo "Testing VayuDrishti AI - AQI Monitoring System"
echo "=============================================="

# Good Air Quality
echo "\n1. Testing Good Air Quality..."
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 150, "humidity": 45, "location": "Test Zone 1"}'

sleep 3

# Moderate Air Quality
echo "\n\n2. Testing Moderate Air Quality..."
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 400, "humidity": 60, "location": "Test Zone 2"}'

sleep 3

# Poor Air Quality
echo "\n\n3. Testing Poor Air Quality..."
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 600, "humidity": 70, "location": "Test Zone 3"}'

sleep 3

# Very Poor Air Quality
echo "\n\n4. Testing Very Poor Air Quality..."
curl -X POST http://localhost:5000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"smoke": 850, "humidity": 75, "location": "Test Zone 4"}'

sleep 3

# Check Dashboard
echo "\n\n5. Fetching Dashboard Data..."
curl http://localhost:5000/api/dashboard

echo "\n\nTest Complete!"
```

Make it executable:
```bash
chmod +x test-scenarios.sh
./test-scenarios.sh
```

---

## Python Test Script

Create `test_api.py`:

```python
import requests
import time
import json

BASE_URL = "http://localhost:5000/api"

test_cases = [
    {
        "name": "Good Air Quality",
        "data": {"smoke": 150, "humidity": 45, "location": "Zone 1"},
        "expected_category": "Good"
    },
    {
        "name": "Moderate Air Quality",
        "data": {"smoke": 400, "humidity": 60, "location": "Zone 2"},
        "expected_category": "Moderate"
    },
    {
        "name": "Poor Air Quality",
        "data": {"smoke": 600, "humidity": 70, "location": "Zone 3"},
        "expected_category": "Poor"
    },
    {
        "name": "Very Poor Air Quality",
        "data": {"smoke": 850, "humidity": 75, "location": "Zone 4"},
        "expected_category": "Very Poor"
    }
]

print("VayuDrishti AI - API Testing")
print("=" * 50)

for i, test in enumerate(test_cases, 1):
    print(f"\nTest {i}: {test['name']}")
    print("-" * 50)
    
    # Send sensor data
    response = requests.post(
        f"{BASE_URL}/sensors/data",
        json=test['data']
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Sensor data received")
        print(f"  Pollution Index: {result['data']['processed']['pollutionIndex']}")
    else:
        print(f"✗ Error: {response.status_code}")
        continue
    
    time.sleep(1)
    
    # Calculate AQI
    response = requests.post(
        f"{BASE_URL}/aqi/calculate",
        json={"smoke": test['data']['smoke'], "humidity": test['data']['humidity']}
    )
    
    if response.status_code == 200:
        result = response.json()
        aqi_data = result['data']
        print(f"✓ AQI calculated: {aqi_data['value']}")
        print(f"  Category: {aqi_data['category']}")
        print(f"  Expected: {test['expected_category']}")
        
        if aqi_data['category'] == test['expected_category']:
            print("  ✓ Test Passed!")
        else:
            print("  ✗ Test Failed - Category mismatch")
    else:
        print(f"✗ Error: {response.status_code}")
    
    time.sleep(2)

# Check dashboard
print("\n\nFetching Dashboard Data...")
print("-" * 50)
response = requests.get(f"{BASE_URL}/dashboard")

if response.status_code == 200:
    dashboard = response.json()['data']
    print(f"Current AQI: {dashboard['aqi']['value']}")
    print(f"Category: {dashboard['aqi']['category']}")
    print(f"Active Alerts: {dashboard['alerts']['count']}")
    print(f"Ventilation: {'ON' if dashboard['automation']['ventilation']['active'] else 'OFF'}")
    print(f"Water Sprinkling: {'ON' if dashboard['automation']['waterSprinkling']['active'] else 'OFF'}")
else:
    print(f"Error fetching dashboard: {response.status_code}")

print("\n" + "=" * 50)
print("Testing Complete!")
```

Run with:
```bash
python test_api.py
```

---

## Simulating Sensor Stream

Create `sensor_simulator.py`:

```python
import requests
import time
import random
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

def send_sensor_data(smoke, humidity, location="Simulated Sensor"):
    """Send sensor data to API"""
    data = {
        "smoke": smoke,
        "humidity": humidity,
        "location": location,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(f"{BASE_URL}/sensors/data", json=data)
        if response.status_code == 200:
            result = response.json()['data']
            print(f"[{datetime.now().strftime('%H:%M:%S')}] "
                  f"Smoke: {smoke:4.0f} | Humidity: {humidity:4.1f}% | "
                  f"Pollution Index: {result['processed']['pollutionIndex']}")
            return True
        else:
            print(f"Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"Connection error: {e}")
        return False

def simulate_normal_conditions(duration_seconds=60):
    """Simulate normal air quality"""
    print("\n=== Simulating Normal Conditions ===")
    start_time = time.time()
    
    while time.time() - start_time < duration_seconds:
        smoke = random.randint(100, 300)
        humidity = random.uniform(40, 60)
        send_sensor_data(smoke, humidity)
        time.sleep(5)

def simulate_degrading_conditions(duration_seconds=120):
    """Simulate degrading air quality"""
    print("\n=== Simulating Degrading Conditions ===")
    start_time = time.time()
    base_smoke = 200
    
    while time.time() - start_time < duration_seconds:
        # Gradually increase smoke levels
        elapsed = time.time() - start_time
        smoke = base_smoke + (elapsed / duration_seconds) * 700
        humidity = random.uniform(60, 80)
        send_sensor_data(smoke, humidity)
        time.sleep(5)

def simulate_critical_event(duration_seconds=30):
    """Simulate critical air quality event"""
    print("\n=== Simulating Critical Event ===")
    start_time = time.time()
    
    while time.time() - start_time < duration_seconds:
        smoke = random.randint(800, 1000)
        humidity = random.uniform(70, 85)
        send_sensor_data(smoke, humidity)
        time.sleep(5)

def main():
    print("VayuDrishti AI - Sensor Data Simulator")
    print("=" * 60)
    print("This will simulate various air quality scenarios")
    print("Watch the dashboard at http://localhost:3000")
    print("=" * 60)
    
    input("\nPress Enter to start simulation...")
    
    # Phase 1: Normal conditions
    simulate_normal_conditions(30)
    
    # Phase 2: Degrading air quality
    simulate_degrading_conditions(60)
    
    # Phase 3: Critical event
    simulate_critical_event(30)
    
    # Phase 4: Return to normal
    simulate_normal_conditions(30)
    
    print("\n=== Simulation Complete ===")
    print("Check the dashboard for alerts and automation status")

if __name__ == "__main__":
    main()
```

Run with:
```bash
python sensor_simulator.py
```

---

## Expected Results

### Good Air Quality (Smoke: 150)
- AQI: 30-50
- Category: Good
- Color: Green
- Alerts: None
- Automation: None

### Moderate Air Quality (Smoke: 400)
- AQI: 70-100
- Category: Moderate
- Color: Yellow
- Alerts: None
- Automation: None

### Poor Air Quality (Smoke: 600)
- AQI: 100-150
- Category: Poor
- Color: Orange
- Alerts: Warning
- Automation: Ventilation ON

### Very Poor Air Quality (Smoke: 850)
- AQI: 150-200
- Category: Very Poor
- Color: Red
- Alerts: Critical
- Automation: Ventilation + Water Sprinkling ON

---

## Monitoring Dashboard Changes

Watch for these UI updates:
1. AQI value and color change
2. Alert notifications appear
3. Automation status indicators activate
4. Cooldown timers start
5. Analytics charts update
