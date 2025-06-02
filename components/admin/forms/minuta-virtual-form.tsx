'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

interface MinutaVirtualFormProps {
  initialData?: {
    id?: string;
    fecha?: Date;
    turno?: string;
    portero?: string;
    novedades?: string;
    estado?: 'pendiente' | 'revisado' | 'archivado';
    adjuntos?: string[];
    observaciones?: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function MinutaVirtualForm({
  initialData,
  onSubmit,
  onCancel,
}: MinutaVirtualFormProps) {
  const [formData, setFormData] = React.useState({
    turno: initialData?.turno || '',
    portero: initialData?.portero || '',
    novedades: initialData?.novedades || '',
    estado: initialData?.estado || 'pendiente',
    observaciones: initialData?.observaciones || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="turno">Turno</Label>
          <Select
            id="turno"
            value={formData.turno}
            onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
          >
            <option value="">Seleccione un turno</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="portero">Portero</Label>
          <Input
            id="portero"
            value={formData.portero}
            onChange={(e) => setFormData({ ...formData, portero: e.target.value })}
            placeholder="Nombre del portero"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="novedades">Novedades</Label>
        <Textarea
          id="novedades"
          value={formData.novedades}
          onChange={(e) => setFormData({ ...formData, novedades: e.target.value })}
          placeholder="Describa las novedades del turno"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Select
          id="estado"
          value={formData.estado}
          onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'pendiente' | 'revisado' | 'archivado' })}
        >
          <option value="pendiente">Pendiente</option>
          <option value="revisado">Revisado</option>
          <option value="archivado">Archivado</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          placeholder="Observaciones adicionales"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Actualizar' : 'Crear'} Minuta
        </Button>
      </DialogFooter>
    </form>
  );
} 