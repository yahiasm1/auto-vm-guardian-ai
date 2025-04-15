
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InfoTab } from './InfoTab';
import { SecurityTab } from './SecurityTab';

export function SettingsTabs() {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-2">
        <TabsTrigger value="info">Personal Info</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-4">
        <InfoTab />
      </TabsContent>
      
      <TabsContent value="security" className="space-y-4">
        <SecurityTab />
      </TabsContent>
    </Tabs>
  );
}
