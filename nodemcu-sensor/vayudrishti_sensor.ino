#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>

// ===================================================
// ✅ PIN CONFIG (NodeMCU pins)
// ===================================================
#define DHTPIN D4          // D4 = GPIO2
#define DHTTYPE DHT11
#define MQ_PIN A0

#define RELAY_LED  D0      // D0 = GPIO16
#define RELAY_PUMP D5      // D5 = GPIO14

// ===================================================
// ✅ WIFI CONFIG
// ===================================================
const char* ssid = "Tenda_700838";
const char* password = "KrishnaBhardwaj@8533";

// ===================================================
// ✅ BACKEND SERVER URL (Your Laptop IP)
// ===================================================
String serverUrl = "http://192.168.0.104:9000/api/sensors";

// Device ID
const char* deviceId = "classroom-01";

// ===================================================
// ✅ SETTINGS
// ===================================================
const int SEND_INTERVAL = 5000;
const int MQ_SAMPLES = 10;

// AQI thresholds
const int AQI_LED_THRESHOLD  = 100;   // LED Relay ON if AQI > 100
const int AQI_PUMP_THRESHOLD = 200;   // Pump Relay ON if AQI > 200

// Pump ON time
const int PUMP_ON_DURATION = 30000;   // 30 sec ON

// ===================================================
// ✅ SENSOR OBJECT
// ===================================================
DHT dht(DHTPIN, DHTTYPE);

// ===================================================
// ✅ GLOBALS
// ===================================================
bool pumpActive = false;
unsigned long pumpStartTime = 0;

// ===================================================
// ✅ HELPER FUNCTIONS
// ===================================================
int clampInt(int value, int minVal, int maxVal) {
  if (value < minVal) return minVal;
  if (value > maxVal) return maxVal;
  return value;
}

int readMQAverage(int samples = MQ_SAMPLES) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(MQ_PIN);
    delay(50);
  }
  return sum / samples;
}

// ✅ LOW Trigger relay functions (ACTIVE LOW relay module)
void relayOn(int pin) {
  digitalWrite(pin, LOW);   // ON
}

void relayOff(int pin) {
  digitalWrite(pin, HIGH);  // OFF
}

// ===================================================
// ✅ SMART AQI CALCULATION (MQ + TEMP + HUM)
// ===================================================
int calculateSmartAQI(int mq, float temp, float hum) {
  // ---- Smoke AQI (0–400) ----
  int mqMin = 300;   // adjust after calibration
  int mqMax = 900;

  int smokeAQI = ((mq - mqMin) * 400) / (mqMax - mqMin);
  smokeAQI = clampInt(smokeAQI, 0, 400);

  // ---- Temperature penalty (0–50) ----
  int tempPenalty = 0;
  if (temp > 30) tempPenalty = (int)((temp - 30) * 2);
  else if (temp < 18) tempPenalty = (int)((18 - temp) * 2);
  tempPenalty = clampInt(tempPenalty, 0, 50);

  // ---- Humidity penalty (0–50) ----
  int humPenalty = 0;
  if (hum > 60) humPenalty = (int)((hum - 60) * 1.5);
  else if (hum < 40) humPenalty = (int)((40 - hum) * 1.5);
  humPenalty = clampInt(humPenalty, 0, 50);

  // ---- Final AQI (0–500) ----
  int finalAQI = smokeAQI + tempPenalty + humPenalty;
  finalAQI = clampInt(finalAQI, 0, 500);

  // ✅ Always show minimum 50
  if (finalAQI <  100) finalAQI = finalAQI + 50;

  return finalAQI;
}

String getStatus(int aqi) {
  if (aqi <= 50) return "GOOD";
  if (aqi <= 100) return "MODERATE";
  if (aqi <= 200) return "POOR";
  if (aqi <= 300) return "VERY_POOR";
  return "SEVERE";
}

// ===================================================
// ✅ SETUP
// ===================================================
void setup() {
  Serial.begin(9600);
  delay(1000);

  Serial.println("\n========================================");
  Serial.println("✅ VayuDrishti Final ESP8266 Code");
  Serial.println("✅ MQ + DHT11 + 2 Relays + API");
  Serial.println("========================================");

  dht.begin();

  pinMode(RELAY_LED, OUTPUT);
  pinMode(RELAY_PUMP, OUTPUT);

  // Start relays OFF
  relayOff(RELAY_LED);
  relayOff(RELAY_PUMP);

  // WiFi connect
  Serial.print("📡 Connecting WiFi: ");
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
    Serial.print("📍 ESP IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("🌐 Backend URL: ");
    Serial.println(serverUrl);
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
  }

  Serial.println("========================================\n");
}

// ===================================================
// ✅ LOOP
// ===================================================
void loop() {
  // ---- Read sensors ----
  int mqAvg = readMQAverage(MQ_SAMPLES);

  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();

  // Validate DHT
  if (isnan(temp) || isnan(hum)) {
    Serial.println("❌ DHT11 Read Failed!");
    delay(2000);
    return;
  }

  if (temp < -10 || temp > 60 || hum < 0 || hum > 100) {
    Serial.println("❌ Invalid DHT values, skipping...");
    delay(2000);
    return;
  }

  // ---- Calculate Smart AQI ----
  int aqi = calculateSmartAQI(mqAvg, temp, hum);
  String status = getStatus(aqi);

  // ===================================================
  // ✅ RELAY CONTROL LOGIC
  // ===================================================

  // Relay 1 (LED) → AQI > 100
  if (aqi > AQI_LED_THRESHOLD) relayOn(RELAY_LED);
  else relayOff(RELAY_LED);

  // Relay 2 (Pump) → AQI > 200 (timer ON)
  if (aqi > AQI_PUMP_THRESHOLD && !pumpActive) {
    relayOn(RELAY_PUMP);
    pumpActive = true;
    pumpStartTime = millis();
    Serial.println("🚨 Pump ON (High AQI)");
  }

  if (pumpActive && (millis() - pumpStartTime >= PUMP_ON_DURATION)) {
    relayOff(RELAY_PUMP);
    pumpActive = false;
    Serial.println("✅ Pump OFF (timer expired)");
  }

  // ===================================================
  // ✅ SERIAL OUTPUT
  // ===================================================
  Serial.println("────────────────────────────────────────");
  Serial.print("🌡 Temp: "); Serial.print(temp, 1); Serial.println(" °C");
  Serial.print("💧 Hum: "); Serial.print(hum, 1); Serial.println(" %");
  Serial.print("💨 MQ Avg: "); Serial.println(mqAvg);
  Serial.print("📊 Smart AQI: "); Serial.println(aqi);
  Serial.print("🎯 Status: "); Serial.println(status);

  Serial.print("💡 LED Relay: ");
  Serial.println(aqi > AQI_LED_THRESHOLD ? "ON ✅" : "OFF ❌");

  Serial.print("🚰 Pump Relay: ");
  Serial.println(pumpActive ? "ON ✅" : "OFF ❌");

  // ===================================================
  // ✅ SEND TO BACKEND API
  // ===================================================
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"deviceId\":\"" + String(deviceId) + "\",";
    payload += "\"mq\":" + String(mqAvg) + ",";
    payload += "\"aqi\":" + String(aqi) + ",";
    payload += "\"temperature\":" + String(temp, 1) + ",";
    payload += "\"humidity\":" + String(hum, 1) + ",";
    payload += "\"status\":\"" + status + "\",";
    payload += "\"ledRelay\":\"" + String(aqi > AQI_LED_THRESHOLD ? "ON" : "OFF") + "\",";
    payload += "\"pumpRelay\":\"" + String(pumpActive ? "ON" : "OFF") + "\"";
    payload += "}";

    int code = http.POST(payload);

    if (code > 0) {
      Serial.print("✅ Data sent | HTTP Code: ");
      Serial.println(code);
    } else {
      Serial.println("❌ HTTP Error: connection failed");
    }

    http.end();
  } else {
    Serial.println("❌ WiFi Disconnected → reconnecting...");
    WiFi.reconnect();
  }

  Serial.println("────────────────────────────────────────\n");
  delay(SEND_INTERVAL);
}
