#!/bin/bash

# VayuDrishti - Test NodeMCU Data Sender
# Simulates sensor data from ESP8266

echo "========================================="
echo "  VayuDrishti - IoT Data Simulator"
echo "  🔥 EXTREME AQI MODE (500-1000)"
echo "========================================="
echo ""

# Configuration
SERVER_URL="http://localhost:9000/api/sensors"
DEVICE_ID="test-device"

echo "🎯 Target: $SERVER_URL"
echo "📱 Device: $DEVICE_ID"
echo ""

# Function to generate EXTREME AQI sensor data (500-1000)
generate_data() {
    # Simulate EXTREME smoke levels for AQI 500-1000
    # MQ must be 0-1023 (Arduino ADC range)
    # For AQI 500-1000, we need MQ values in the upper range
    # AQI formula: roughly (MQ/1023)*600, so for 500-1000 we need high MQ values
    MQ=$((850 + RANDOM % 174))          # 850-1023 range (generates AQI ~500-1000)
    
    # Temperature: -10 to 60°C (DHT11 valid range)
    # Higher temps indicate FIRE
    TEMP=$((35 + RANDOM % 26))          # 35-60 °C (hot to extreme)
    
    # Humidity: 0-100% (DHT11 valid range)
    # Lower humidity indicates FIRE
    HUM=$((5 + RANDOM % 46))            # 5-50% (very low for extreme conditions)
    
    # Let backend calculate AQI from MQ value - don't send AQI
    # This ensures real-time calculation and varying values
    echo "{\"deviceId\":\"$DEVICE_ID\",\"mq\":$MQ,\"temperature\":$TEMP,\"humidity\":$HUM}"
}

# Send data in loop
echo "📊 Sending EXTREME AQI data (500-1000) every 3 seconds..."
echo "   🤖 ML Classification will trigger (FIRE vs POLLUTION)"
echo "   Press Ctrl+C to stop"
echo ""

counter=1
while true; do
    DATA=$(generate_data)
    
    # Extract values for display
    MQ=$(echo $DATA | grep -o '"mq":[0-9]*' | cut -d: -f2)
    TEMP=$(echo $DATA | grep -o '"temperature":[0-9]*' | cut -d: -f2)
    HUM=$(echo $DATA | grep -o '"humidity":[0-9]*' | cut -d: -f2)
    
    # Calculate approximate AQI for display (MQ to AQI conversion)
    # Formula: AQI = (MQ / 1023) * 600 (rough approximation)
    AQI=$(awk "BEGIN {printf \"%.0f\", ($MQ / 1023) * 600}")
    
    echo "[$counter] Sending: MQ=$MQ, AQI=$AQI, Temp=${TEMP}°C, Hum=${HUM}%"
    
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
