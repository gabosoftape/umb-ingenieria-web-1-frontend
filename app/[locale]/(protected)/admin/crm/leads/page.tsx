'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Lead, LeadsService } from '@/services/leads.service';




const columns = [
  { key: 'id', label: 'id' },
  { key: 'name', label: 'name' },
  {
    key: 'active',
    label: 'activo',
    render: (value: string) => (
      <Badge className={
        value == "false" ? 'bg-purple-500' :
        'bg-green-500'
      }>
        {value == "false" ? 'No' :'Si'}
      </Badge>
    ),
  },
  { key: 'account_id', label: 'cuenta' },
  { key: 'description', label: 'descripcion' },
  { key: 'user_id', label: 'usuarios' },
  { key: 'type', label: 'tipo' },
  { key: 'stage_id', label: 'estado' },

];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeads, setEditingLeads] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({
    id: '',
    name: '',
    user_id: '',
    account_id: 0,
    description: '',
    active: true,
    type: '',
    stage_id: 1


  });

  const handleAdd = () => {
    setEditingLeads(null);
    setFormData({
      id: '',
      name: '',
      user_id: '',
      account_id: 0,
      description: '',
      active: true,
      type: '',
      stage_id: 1
    });
    setIsModalOpen(true);
  };

  const handleEdit = (leads: Lead) => {
    setEditingLeads(leads);
    setFormData({
      id: leads.id,
      name: leads.name,
      user_id: leads.user_id,
      account_id: leads.account_id,
      description: leads.description,
      active: leads.active,
      type: leads.type,
      stage_id: leads.stage_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (leads: Lead) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      const resp = await LeadsService.deleteLeads(leads.id);
      console.log(resp);
      LeadsService.getLeads().then((leadsData: Lead[]) => {
        setLeads(leadsData);
      });
      alert('Usuario eliminado exitosamente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLeads) {
      // Actualizar leads existente
      const resp = await LeadsService.updateLeads(editingLeads);
      console.log(resp);
      alert('Usuario actualizado exitosamente');
    } else {
      // Crear nuevo leads
      const newLeads = {
        ...formData,
      } as unknown as Lead;
      const resp = await LeadsService.createLeads(newLeads);
      console.log(resp);
      alert('Usuario creado exitosamente');
    }
    LeadsService.getLeads().then((leadsData: Lead[]) => {
      setLeads(leadsData);
    });
    setIsModalOpen(false);
  };

  useEffect(()=> {
    // get Data leads
    LeadsService.getLeads().then((leadsData: Lead[]) => {
      console.log(leadsData);
      setLeads(leadsData);
    });
  }, [])

  return (
    <div className="container mx-auto p-6">
      <DataTable
        title="Gestión de Clientes potenciales "
        columns={columns}
        data={leads}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLeads ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
            

    

              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Identificacion de usuario</label>
                <Input
                  value={formData.user_id}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    user_id: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripcion</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Activo</label>
                <Input
                type='checkbox'
                  checked={formData.active}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    active: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    type: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Etapa</label>
                <Input
                  value={formData.stage_id}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    stage_id: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingLeads ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 