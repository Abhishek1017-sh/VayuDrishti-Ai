import React from 'react';
import AdminAlerts from './Alerts/AdminAlerts';
import IndustryAlerts from './Alerts/IndustryAlerts';
import HomeAlerts from './Alerts/HomeAlerts';

const Alerts = ({ userRole = 'home', facilityId, deviceId }) => {
  const renderAlertPage = () => {
    switch (userRole) {
      case 'admin':
        return <AdminAlerts />;
      case 'industry':
        return <IndustryAlerts facilityId={facilityId} />;
      case 'home':
      default:
        return <HomeAlerts deviceId={deviceId} />;
    }
  };

  return renderAlertPage();
};

export default Alerts;
