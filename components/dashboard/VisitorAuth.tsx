'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Visitor {
  id: string;
  name: string;
  destination: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

export const VisitorAuth = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      destination: 'Apartamento 301',
      status: 'pending',
      timestamp: new Date(),
    },
    {
      id: '2',
      name: 'María González',
      destination: 'Apartamento 502',
      status: 'pending',
      timestamp: new Date(),
    },
  ]);

  const handleApprove = (visitorId: string) => {
    setVisitors(visitors.map(visitor => 
      visitor.id === visitorId ? { ...visitor, status: 'approved' } : visitor
    ));
  };

  const handleReject = (visitorId: string) => {
    setVisitors(visitors.map(visitor => 
      visitor.id === visitorId ? { ...visitor, status: 'rejected' } : visitor
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Autorización de Visitantes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visitors.map((visitor) => (
            <div key={visitor.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{visitor.name}</p>
                <p className="text-sm text-gray-500">{visitor.destination}</p>
                <Badge className={
                  visitor.status === 'approved' ? 'bg-green-500' : 
                  visitor.status === 'rejected' ? 'bg-red-500' : 
                  'bg-yellow-500'
                }>
                  {visitor.status === 'approved' ? 'Aprobado' : 
                   visitor.status === 'rejected' ? 'Rechazado' : 
                   'Pendiente'}
                </Badge>
              </div>
              {visitor.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(visitor.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleReject(visitor.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 