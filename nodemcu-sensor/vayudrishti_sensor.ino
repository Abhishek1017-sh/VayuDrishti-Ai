/**
 * VayuDrishti IoT Sensor Node
 * ESP8266 NodeMCU with MQ Smoke Sensor + DHT11
 * 
 * Hardware Connections:
 * - MQ Sensor -> A0 (Analog input)
 * - DHT11 Data -> D4 (GPIO2)
 * - DHT11 VCC -> 3.3V
 * - DHT11 GND -> GND
 * - MQ VCC -> 5V (from VIN)
 * - MQ GND -> GND
 * 
 * Installation:
 * 1. Install Arduino IDE
 * 2. Add ESP8266 board: File -> Preferences -> Additional Board URLs:
 *    http://arduino.esp8266.com/stable/package_esp8266com_index.json
 * 3. Install libraries:
 *    - ESP8266WiFi (built-in)
 *    - ESP8266HTTPClient (built-in)
 *    - DHT sensor library (by Adafruit)
 * 4. Select Board: NodeMCU 1.0 (ESP-12E Module)
 * 5. Update WiFi credentials and server URL below
 * 6. Upload to ESP8266
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>

#define DHTPIN D4        // DHT11 data pin connected to GPIO2 (D4)
#define DHTTYPE DHT11    // DHT sensor type
#define MQ_PIN A0        // MQ sensor analog pin

const char* ssid = "YOUR_WIFI_NAME";           // Your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password

// ========================================
// SERVER CONFIGURATION
// ========================================
// ⚠️ REPLACE WITH YOUR LAPTOP/SERVER IP ADDRESS
// Find your IP:
//   - Mac: Open Terminal, run: ipconfig getifaddr en0
//   - Windows: Open CMD, run: ipconfig
//   - Linux: ifconfig or ip addr show
String serverUrl = "http://192.168.1.5:9000/api/sensors";

// Device identification
const char* deviceId = "classroom-01";

// ========================================
// SENSOR THRESHOLDS & SETTINGS
// ========================================
const int SEND_INTERVAL = 5000;    // Send data every 5 seconds (5000ms)
const int MQ_SAMPLES = 10;         // Number of MQ readings to average
const int AQI_THRESHOLD = 100;     // AQI threshold for triggering relay
const int RELAY_ON_DURATION = 30000; // Keep relay ON for 30 seconds when triggered

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Relay control variables
bool relayActive = false;
unsigned long relayActivatedTime = 0;

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Read MQ sensor with averaging for noise reduction
 * Takes multiple samples and returns the average
 */
int readMQAverage(int samples = MQ_SAMPLES) {
  long sum = 0;
  
  for (int i = 0; i < samples; i++) {
    sum += analogRead(MQ_PIN);
    delay(50); // Small delay between readings
  }
  
  return sum / samples;
}

/**
 * Clamp integer value between min and max
 */
int clampInt(int value, int minVal, int maxVal) {
  if (value < minVal) return minVal;
  if (value > maxVal) return maxVal;
  return value;
}

/**
 * Convert MQ sensor reading to AQI score (0-500)
 * Based on empirical mapping for classroom environment
 * Adjust these values based on your sensor calibration
 */
int mqToAQI(int mqValue) {
  // Mapping parameters
  const int minMQ = 300;   // Clean air baseline
  const int maxMQ = 900;   // Severe pollution threshold
  const int minAQI = 0;
  const int maxAQI = 500;
  
  // Linear mapping
  int aqi = ((mqValue - minMQ) * (maxAQI - minAQI)) / (maxMQ - minMQ) + minAQI;
  
  // Clamp to valid AQI range
  return clampInt(aqi, minAQI, maxAQI);
}

/**
 * Get air quality status category based on AQI
 */
String getStatus(int aqi) {
  if (aqi <= 50) return "GOOD";
  if (aqi <= 100) return "MODERATE";
  if (aqi <= 200) return "POOR";
  if (aqi <= 300) return "VERY_POOR";
  return "SEVERE";
}

/**
 * Get status emoji for serial monitor
 */
String getStatusEmoji(String status) {
  if (status == "GOOD") return "✅";
  if (status == "MODERATE") return "🙂";
  if (status == "POOR") return "⚠️";
  if (status == "VERY_POOR") return "🚨";
  return "🔥";
}

// ========================================
// SETUP
// ========================================
void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("========================================");
  Serial.println("  VayuDrishti IoT Sensor Node");
  Serial.println("  ESP8266 + MQ Sensor + DHT11");
  Serial.println("========================================");
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("✅ DHT11 sensor initialized");
  
  // Initialize MQ sensor pin
  pinMode(MQ_PIN, INPUT);
  Serial.println("✅ MQ sensor initialized");
  
  // Initialize Relay pin
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Start with relay OFF
  Serial.println("✅ Relay initialized (OFF)");
  
  // Connect to WiFi
  Serial.print("\n📡 Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("🌐 Server URL: ");
    Serial.println(serverUrl);
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    Serial.println("⚠️  Check your WiFi credentials and try again");
  }
  
  Serial.println("========================================");
  Serial.println("Starting sensor readings...\n");
}

// ========================================
// MAIN LOOP
// ========================================
void loop() {
  // Read MQ sensor with averaging
  int mqAvg = readMQAverage(MQ_SAMPLES);
  
  // Read DHT11 sensor
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  // ========================================
  // VALIDATE DHT READINGS
  // ========================================
  if (isnan(temp) || isnan(hum)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    delay(2000);
    return;
  }
  
  // Validate temperature range
  if (temp < -10 || temp > 60) {
    Serial.println("❌ Invalid temperature reading, skipping...");
    delay(2000);
    return;
  }
  
  // Validate humidity range
  if (hum < 0 || hum > 100) {
    Serial.println("❌ Invalid humidity reading, skipping...");
    delay(2000);
    return;
  }
  
  // ========================================
  // CALCULATE AQI
  // ========================================
  int aqi = mqToAQI(mqAvg);
  String status = getStatus(aqi);
  String emoji = getStatusEmoji(status);
  
  // ========================================
  // DISPLAY ON SERIAL MONITOR
  // ========================================
  Serial.println("────────────────────────────────────────");
  Serial.print("🌡️  Temperature: ");
  Serial.print(temp, 1);
  Serial.println(" °C");
  
  Serial.print("💧 Humidity: ");
  Serial.print(hum, 1);
  Serial.println(" %");
  
  Serial.print("💨 MQ Reading: ");
  Serial.println(mqAvg);
  
  Serial.print("📊 AQI Score: ");
  Serial.print(aqi);
  Serial.print(" ");
  Serial.println(emoji);
  
  Serial.print("🎯 Status: ");
  Serial.println(status);
  
  // ========================================
  // RELAY CONTROL (AQI > 100)
  // ========================================
  if (aqi > AQI_THRESHOLD && !relayActive) {
    // Turn relay ON when AQI exceeds threshold
    digitalWrite(RELAY_PIN, HIGH);
    relayActive = true;
    relayActivatedTime = millis();
    
    Serial.println("🚨 AQI ALERT! Relay activated!");
    Serial.print("   → AQI (");
    Serial.print(aqi);
    Serial.print(") > Threshold (");
    Serial.print(AQI_THRESHOLD);
    Serial.println(")");
  }
  
  // Auto turn OFF relay after duration
  if (relayActive && (millis() - relayActivatedTime >= RELAY_ON_DURATION)) {
    digitalWrite(RELAY_PIN, LOW);
    relayActive = false;
    Serial.println("✅ Relay deactivated (timer expired)");
  }
  
  // Display relay status
  Serial.print("🔌 Relay Status: ");
  Serial.println(relayActive ? "ON ⚡" : "OFF");
  
  // ========================================
  // SEND DATA TO BACKEND SERVER
  // ========================================
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    // Begin HTTP connection
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Build JSON payload
    String jsonPayload = "{";
    jsonPayload += "\"deviceId\":\"" + String(deviceId) + "\",";
    jsonPayload += "\"mq\":" + String(mqAvg) + ",";
    jsonPayload += "\"aqi\":" + String(aqi) + ",";
    jsonPayload += "\"temperature\":" + String(temp, 1) + ",";
    jsonPayload += "\"humidity\":" + String(hum, 1) + ",";
    jsonPayload += "\"status\":\"" + status + "\",";
    jsonPayload += "\"relayStatus\":\"" + String(relayActive ? "ON" : "OFF") + "\"";
    jsonPayload += "}";
    
    // Send POST request
    int httpResponseCode = http.POST(jsonPayload);
    
    // Check response
    if (httpResponseCode > 0) {
      Serial.print("✅ Data sent to server | Response: ");
      Serial.println(httpResponseCode);
      
      if (httpResponseCode == 201 || httpResponseCode == 200) {
        Serial.println("   → Data saved successfully!");
      }
    } else {
      Serial.print("❌ HTTP Error: ");
      Serial.println(http.errorToString(httpResponseCode));
      Serial.println("   → Check server URL and network connection");
    }
    
    http.end();
  } else {
    Serial.println("❌ WiFi Disconnected!");
    Serial.println("   → Attempting to reconnect...");
    WiFi.reconnect();
  }
  
  Serial.println("────────────────────────────────────────\n");
  
  // Wait before next reading
  delay(SEND_INTERVAL);
}
