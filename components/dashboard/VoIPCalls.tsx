'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneCall, PhoneOff, User } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  extension: string;
  role: string;
  status: 'available' | 'busy' | 'offline';
}

interface ActiveCall {
  id: string;
  contact: Contact;
  startTime: Date;
  duration: number;
}

export const VoIPCalls = () => {
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Portería Principal',
      extension: '101',
      role: 'Seguridad',
      status: 'available',
    },
    {
      id: '2',
      name: 'Portería Sur',
      extension: '102',
      role: 'Seguridad',
      status: 'busy',
    },
    {
      id: '3',
      name: 'Oficina Administración',
      extension: '201',
      role: 'Administración',
      status: 'available',
    },
  ]);

  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);

  const startCall = (contact: Contact) => {
    setActiveCall({
      id: Math.random().toString(36).substr(2, 9),
      contact,
      startTime: new Date(),
      duration: 0,
    });

    // Simular actualización de duración de llamada
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Limpiar intervalo cuando se desmonte el componente
    return () => clearInterval(interval);
  };

  const endCall = () => {
    setActiveCall(null);
    setCallDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Sistema VoIP
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeCall ? (
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Llamada en curso con {activeCall.contact.name}</p>
                <p className="text-sm text-gray-500">Extensión: {activeCall.contact.extension}</p>
                <p className="text-sm text-gray-500">Duración: {formatDuration(callDuration)}</p>
              </div>
              <Button
                variant="ghost"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={endCall}
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">Ext. {contact.extension}</p>
                    <p className="text-sm text-gray-500">{contact.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    contact.status === 'available' ? 'bg-green-500' :
                    contact.status === 'busy' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`} />
                  <Button
                    variant="default"
                    disabled={contact.status !== 'available'}
                    onClick={() => startCall(contact)}
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 