import React from 'react';
import { CallCenter } from '@/components/dashboard/CallCenter';
import { VisitorAuth } from '@/components/dashboard/VisitorAuth';
import { Notifications } from '@/components/dashboard/Notifications';
import { VoIPCalls } from '@/components/dashboard/VoIPCalls';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Control - Portería</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primera fila */}
        <div className="space-y-6">
          <CallCenter />
          <VisitorAuth />
        </div>
        
        {/* Segunda fila */}
        <div className="space-y-6">
          <Notifications />
          <VoIPCalls />
        </div>
      </div>
    </div>
  );
} 