#!/bin/bash

# VayuDrishti - Test NodeMCU Data Sender
# Simulates sensor data from ESP8266

echo "========================================="
echo "  VayuDrishti - IoT Data Simulator"
echo "========================================="
echo ""

# Configuration
SERVER_URL="http://localhost:9000/api/sensors"
DEVICE_ID="test-device"

echo "🎯 Target: $SERVER_URL"
echo "📱 Device: $DEVICE_ID"
echo ""

# Function to generate random sensor data
generate_data() {
    # Simulate realistic sensor readings
    MQ=$((300 + RANDOM % 600))          # 300-900 range
    TEMP=$(echo "20 + $RANDOM % 15" | bc)  # 20-35°C
    HUM=$(echo "40 + $RANDOM % 40" | bc)   # 40-80%
    
    # Calculate AQI
    if [ $MQ -lt 400 ]; then
        AQI=$((($MQ - 300) * 50 / 100))
        STATUS="GOOD"
    elif [ $MQ -lt 500 ]; then
        AQI=$((50 + ($MQ - 400) * 50 / 100))
        STATUS="MODERATE"
    elif [ $MQ -lt 600 ]; then
        AQI=$((100 + ($MQ - 500) * 100 / 100))
        STATUS="POOR"
    elif [ $MQ -lt 700 ]; then
        AQI=$((200 + ($MQ - 600) * 100 / 100))
        STATUS="VERY_POOR"
    else
        AQI=$((300 + ($MQ - 700) * 200 / 200))
        STATUS="SEVERE"
    fi
    
    echo "{\"deviceId\":\"$DEVICE_ID\",\"mq\":$MQ,\"aqi\":$AQI,\"temperature\":$TEMP,\"humidity\":$HUM,\"status\":\"$STATUS\"}"
}

# Send data in loop
echo "📊 Sending test data every 3 seconds..."
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
