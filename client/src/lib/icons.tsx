
import { FiServer, FiMonitor, FiHardDrive, FiUsers } from 'react-icons/fi';
import React from 'react';

export const ServerIcon = ({ size = 18 }: { size?: number }) => <FiServer size={size} />;

export const VMIcon = ({ size = 18 }: { size?: number }) => <FiMonitor size={size} />;

export const StorageIcon = ({ size = 18 }: { size?: number }) => <FiHardDrive size={size} />;

export const UserIcon = ({ size = 18 }: { size?: number }) => <FiUsers size={size} />;
