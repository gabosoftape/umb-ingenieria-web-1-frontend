'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, PhoneIncoming, PhoneOff } from 'lucide-react';

interface Call {
  id: string;
  from: string;
  status: 'incoming' | 'active' | 'ended';
  timestamp: Date;
}

export const CallCenter = () => {
  const [calls, setCalls] = useState<Call[]>([
    {
      id: '1',
      from: 'Portería Principal',
      status: 'incoming',
      timestamp: new Date(),
    },
    {
      id: '2',
      from: 'Portería Sur',
      status: 'active',
      timestamp: new Date(),
    },
  ]);

  const handleAnswerCall = (callId: string) => {
    setCalls(calls.map(call => 
      call.id === callId ? { ...call, status: 'active' } : call
    ));
  };

  const handleEndCall = (callId: string) => {
    setCalls(calls.map(call => 
      call.id === callId ? { ...call, status: 'ended' } : call
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5" />
          Centro de Llamadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calls.filter(call => call.status !== 'ended').map((call) => (
            <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{call.from}</p>
                <p className="text-sm text-gray-500">
                  {call.status === 'incoming' ? 'Llamada entrante' : 'En llamada'}
                </p>
              </div>
              <div className="flex gap-2">
                {call.status === 'incoming' && (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAnswerCall(call.id)}
                  >
                    <PhoneIncoming className="h-4 w-4 mr-2" />
                    Contestar
                  </Button>
                )}
                {call.status === 'active' && (
                  <Button
                    variant="ghost"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleEndCall(call.id)}
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 