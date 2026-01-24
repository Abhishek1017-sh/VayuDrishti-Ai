/**
 * Notification Service
 * Handles sending notifications for critical alerts
 */

const sendNotification = async (notificationData) => {
  const { type, title, message, facilityId } = notificationData;
  
  try {
    console.log(`📢 Notification - ${title}: ${message}`);
    
    // TODO: Integrate with email/SMS service
    // For now, just log the notification
    
    switch (type) {
      case 'critical_alert':
        console.log(`🚨 CRITICAL ALERT for Facility ${facilityId}: ${title}`);
        // Send email to facility admin
        // await sendEmail(facilityAdmins, title, message);
        break;
      
      case 'warning_alert':
        console.log(`⚠️ WARNING for Facility ${facilityId}: ${title}`);
        // Send notification to facility users
        break;
      
      case 'device_offline':
        console.log(`❌ Device offline for Facility ${facilityId}`);
        // Notify facility managers
        break;
      
      default:
        console.log(`ℹ️ ${title}: ${message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Send emergency alert to fire brigade
const sendFireBrigadeEmail = async (alertData) => {
  const { zone, aqi, deviceId, fireBrigadeEmail, fireBrigadeName, phone, address } = alertData;
  
  try {
    console.log(`🚨 EMERGENCY ALERT - AQI: ${aqi} in ${zone}`);
    console.log(`   Zone: ${zone}`);
    console.log(`   Device: ${deviceId}`);
    console.log(`   AQI Level: ${aqi} (CRITICAL)`);
    console.log(`   Recipient: ${fireBrigadeEmail}`);
    console.log(`   Fire Brigade: ${fireBrigadeName}`);
    console.log(`   Phone: ${phone || 'N/A'}`);
    console.log(`   Address: ${address || 'N/A'}`);
    
    // TODO: Integrate with email service (NodeMailer, SendGrid, AWS SES, etc.)
    // For now, log the notification details
    console.log(`✅ Email notification logged for ${fireBrigadeEmail}`);
    
    return true;
  } catch (error) {
    console.error('Error sending fire brigade email:', error);
    return false;
  }
};

module.exports = {
  sendNotification,
  sendFireBrigadeEmail,
  sendEmergencyAlert: sendFireBrigadeEmail // Alias for backward compatibility
};
