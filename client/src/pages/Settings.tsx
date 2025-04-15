
import React from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { SettingsTabs } from '@/components/Settings/SettingsTabs';
import { useAuth } from '@/lib/auth';

export default function Settings() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout title="Settings" userType={user?.role as "admin" | "student" | "instructor"}>
      <div className="max-w-4xl mx-auto">
        <SettingsTabs />
      </div>
    </DashboardLayout>
  );
}
