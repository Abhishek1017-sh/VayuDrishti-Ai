#!/bin/bash

# VayuDrishti - Test NodeMCU Data Sender
# Simulates sensor data from ESP8266

echo "========================================="
echo "  VayuDrishti - IoT Data Simulator"
echo "  🔥 HIGH AQI MODE (500+ for ML)"
echo "========================================="
echo ""

# Configuration
SERVER_URL="http://localhost:9000/api/sensors"
DEVICE_ID="test-device"

echo "🎯 Target: $SERVER_URL"
echo "📱 Device: $DEVICE_ID"
echo ""

# Function to generate HIGH AQI sensor data (500+ for ML testing)
generate_data() {
    # Simulate CRITICAL smoke levels for ML FIRE/POLLUTION detection
    # MQ must be 0-1023 (Arduino ADC range)
    # Generate values from 901-1023 for varying AQI (501-602)
    MQ=$((901 + RANDOM % 123))          # 901-1023 range (ensures AQI varies)
    
    # Temperature: -10 to 60°C (DHT11 valid range)
    # Higher temps indicate FIRE
    TEMP=$((30 + RANDOM % 31))          # 30-60 °C (warm to hot)
    
    # Humidity: 0-100% (DHT11 valid range)
    # Lower humidity indicates FIRE
    HUM=$((10 + RANDOM % 71))           # 10-80%
    
    # Let backend calculate AQI from MQ value - don't send AQI
    # This ensures real-time calculation and varying values
    echo "{\"deviceId\":\"$DEVICE_ID\",\"mq\":$MQ,\"temperature\":$TEMP,\"humidity\":$HUM}"
}

# Send data in loop
echo "📊 Sending CRITICAL AQI data (500+) every 3 seconds..."
echo "   🤖 ML Classification will trigger (FIRE vs POLLUTION)"
echo "   Press Ctrl+C to stop"
echo ""

counter=1
while true; do
    DATA=$(generate_data)
    
    # Extract values for display
    MQ=$(echo $DATA | grep -o '"mq":[0-9]*' | cut -d: -f2)
    AQI=$(echo $DATA | grep -o '"aqi":[0-9]*' | cut -d: -f2)
    TEMP=$(echo $DATA | grep -o '"temperature":[0-9]*' | cut -d: -f2)
    HUM=$(echo $DATA | grep -o '"humidity":[0-9]*' | cut -d: -f2)
    STATUS=$(echo $DATA | grep -o '"status":"[A-Z_]*"' | cut -d'"' -f4)
    
    echo "[$counter] Sending: MQ=$MQ, AQI=$AQI, Temp=${TEMP}°C, Hum=${HUM}%, Status=$STATUS"
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $SERVER_URL \
        -H "Content-Type: application/json" \
        -d "$DATA")
    
    if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ]; then
        echo "    ✅ Success (HTTP $RESPONSE)"
    else
        echo "    ❌ Failed (HTTP $RESPONSE)"
    fi
    
    echo ""
    counter=$((counter + 1))
    sleep 3
done
