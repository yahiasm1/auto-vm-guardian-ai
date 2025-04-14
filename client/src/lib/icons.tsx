
import { FiServer, FiMonitor, FiHardDrive, FiUsers } from 'react-icons/fi';
import React from 'react';

// Create proper React components for each icon
export const ServerIcon = ({ size = 18 }: { size?: number }) => {
  return React.createElement(FiServer, { size });
};

export const VMIcon = ({ size = 18 }: { size?: number }) => {
  return React.createElement(FiMonitor, { size });
};

export const StorageIcon = ({ size = 18 }: { size?: number }) => {
  return React.createElement(FiHardDrive, { size });
};

export const UserIcon = ({ size = 18 }: { size?: number }) => {
  return React.createElement(FiUsers, { size });
};
