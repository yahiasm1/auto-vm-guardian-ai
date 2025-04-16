
import { FiServer, FiMonitor, FiHardDrive, FiUsers, FiCpu, FiSettings, FiLayers } from 'react-icons/fi';
import React from 'react';

export const ServerIcon = ({ size = 18 }: { size?: number }) => <FiServer size={size} />;

export const VMIcon = ({ size = 18 }: { size?: number }) => <FiMonitor size={size} />;

export const StorageIcon = ({ size = 18 }: { size?: number }) => <FiHardDrive size={size} />;

export const UserIcon = ({ size = 18 }: { size?: number }) => <FiUsers size={size} />;

export const CpuIcon = ({ size = 18 }: { size?: number }) => <FiCpu size={size} />;

export const GearIcon = ({ size = 18 }: { size?: number }) => <FiSettings size={size} />;

export const LayersIcon = ({ size = 18 }: { size?: number }) => <FiLayers size={size} />;

export const DashboardIcon = ({ size = 18 }: { size?: number }) => <FiMonitor size={size} />;
