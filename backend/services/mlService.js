/**
 * ML Service - Node.js to Python ML Model Bridge
 * 
 * Handles communication with Python ML model for FIRE vs POLLUTION classification.
 * Implements fail-safe logic and proper error handling.
 */

const { spawn } = require('child_process');
const path = require('path');

const ML_DIR = path.join(__dirname, '../ml');
const PREDICT_SCRIPT = path.join(ML_DIR, 'predict.py');
const AQI_THRESHOLD = 500; // Only run ML when AQI >= 500

class MLService {
  /**
   * Classify event as FIRE or POLLUTION using ML model
   * 
   * @param {Object} sensorData - Sensor readings
   * @param {Array<number>} sensorData.smoke - 60 smoke readings (PPM)
   * @param {Array<number>} sensorData.humidity - 60 humidity readings (%)
   * @param {Array<number>} sensorData.temperature - 60 temperature readings (°C)
   * @param {number} sensorData.aqi - Current AQI value
   * @returns {Promise<Object>} Classification result
   */
  static async classifyEvent(sensorData) {
    try {
      // Validate input
      if (!sensorData || !sensorData.smoke || !sensorData.humidity || !sensorData.temperature) {
        throw new Error('Missing required sensor data (smoke, humidity, temperature)');
      }

      // Validate data length
      const minReadings = 60;
      if (sensorData.smoke.length < minReadings) {
        throw new Error(`Insufficient data: ${sensorData.smoke.length} readings (minimum ${minReadings} required)`);
      }

      // Check AQI threshold
      if (sensorData.aqi && sensorData.aqi < AQI_THRESHOLD) {
        return {
          shouldRunML: false,
          message: `AQI ${sensorData.aqi} below threshold ${AQI_THRESHOLD}. ML not triggered.`,
          aqi: sensorData.aqi,
          threshold: AQI_THRESHOLD
        };
      }

      // Call Python ML model
      const result = await this._callPythonPredict(sensorData);
      
      return {
        shouldRunML: true,
        ...result
      };

    } catch (error) {
      console.error('❌ ML Service Error:', error.message);
      
      // FAIL-SAFE: Default to FIRE on any error
      return {
        cause: 'FIRE',
        confidence: 0.0,
        fire_probability: 0.0,
        pollution_probability: 0.0,
        decision_source: 'error_fail_safe',
        error: true,
        error_message: error.message,
        threshold_used: 0.70
      };
    }
  }

  /**
   * Call Python prediction script
   * 
   * @private
   * @param {Object} sensorData - Sensor data
   * @returns {Promise<Object>} ML prediction result
   */
  static _callPythonPredict(sensorData) {
    return new Promise((resolve, reject) => {
      const python = spawn('python', [PREDICT_SCRIPT], {
        cwd: ML_DIR
      });

      let stdoutData = '';
      let stderrData = '';

      // Send sensor data as JSON to stdin
      python.stdin.write(JSON.stringify(sensorData));
      python.stdin.end();

      // Collect stdout
      python.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      // Collect stderr
      python.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      // Handle process completion
      python.on('close', (code) => {
        if (code !== 0) {
          console.error('Python stderr:', stderrData);
          reject(new Error(`Python script failed with code ${code}: ${stderrData}`));
          return;
        }

        try {
          const result = JSON.parse(stdoutData);
          
          if (result.error) {
            reject(new Error(result.message || 'ML prediction failed'));
            return;
          }

          resolve(result);
        } catch (parseError) {
          console.error('Failed to parse Python output:', stdoutData);
          reject(new Error(`Failed to parse ML output: ${parseError.message}`));
        }
      });

      // Handle spawn errors
      python.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`));
      });
    });
  }

  /**
   * Check if AQI exceeds threshold for ML activation
   * 
   * @param {number} aqi - Current AQI value
   * @returns {boolean} True if ML should be triggered
   */
  static shouldTriggerML(aqi) {
    return aqi >= AQI_THRESHOLD;
  }

  /**
   * Get ML service status and configuration
   * 
   * @returns {Object} Service status
   */
  static getStatus() {
    const fs = require('fs');
    const modelPath = path.join(ML_DIR, 'model', 'fire_pollution_model.pkl');
    
    return {
      mlEnabled: true,
      modelPath: modelPath,
      modelExists: fs.existsSync(modelPath),
      aqiThreshold: AQI_THRESHOLD,
      fireConfidenceThreshold: 0.70,
      pythonScript: PREDICT_SCRIPT,
      failSafeMode: 'FIRE'
    };
  }
}

module.exports = MLService;
