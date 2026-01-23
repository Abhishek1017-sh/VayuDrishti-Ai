import React from 'react';
import AdminDevices from './Devices/AdminDevices';
import IndustryDevices from './Devices/IndustryDevices';
import HomeDevices from './Devices/HomeDevices';

const Devices = ({ userRole = 'home', facilityId, deviceId }) => {
  const renderDevicePage = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDevices />;
      case 'industry':
        return <IndustryDevices facilityId={facilityId} />;
      case 'home':
      default:
        return <HomeDevices deviceId={deviceId} />;
    }
  };

  return renderDevicePage();
};

export default Devices;
