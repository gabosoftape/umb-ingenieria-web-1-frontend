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
import { CreateStageDto, Stage, StageService } from '@/services/stage.service';
import { useAuth } from '@/contexts/auth.context';



const columns = [
  { key: 'id', label: 'id' },
  { key: 'name', label: 'name' },
  {
    key: 'is_won',
    label: 'etapa ganadora',
    render: (value: string) => (
      <Badge className={
        value == "false" ? 'bg-purple-500' :
        'bg-green-500'
      }>
        {value == "false" ? 'No' :'Si'}
      </Badge>
    ),
  },
  { key: 'sequence', label: 'Sequencia' },
  { key: 'requirements', label: 'Requerimientos' },
];

export default function EtapasPage() {
  const {account} = useAuth();
  const [stages, setStages] = useState<Stage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [formData, setFormData] = useState<Partial<Stage>>({
    is_won: true,
    name: '',
    requirements: '',
    sequence: 1,
  });

  const handleAdd = () => {
    setEditingStage(null);
    setFormData({
      is_won: true,
      name: '',
      requirements: '',
      sequence: 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (stage: Stage) => {
    setEditingStage(stage);
    setFormData({
      id: stage.id,
      is_won: stage.is_won,
      name: stage.name,
      requirements: stage.requirements,
      sequence: stage.sequence,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (stage: Stage) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      const resp = await StageService.deleteStage(stage.id);
      console.log(resp);
      StageService.getStages().then((stagesData: Stage[]) => {
        setStages(stagesData);
      });
      alert('Usuario eliminado exitosamente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStage) {
      // Actualizar etapa existente
      const resp = await StageService.updateStage(formData, account.id!);
      console.log(resp);
      alert('Usuario actualizado exitosamente');
    } else {
      // Crear nuevo etapa
      const newStage = {
        ...formData,
      } as unknown as CreateStageDto;
      const resp = await StageService.createStage(newStage, account.id!);
      console.log(resp);
      alert('Usuario creado exitosamente');
    }
    StageService.getStages().then((stagesData: Stage[]) => {
      setStages(stagesData);
    });
    setIsModalOpen(false);
  };

  useEffect(()=> {
    // get Data stage
    StageService.getStages().then((stagesData: Stage[]) => {
      setStages(stagesData);
    });
  }, [])

  return (
    <div className="container mx-auto p-6">
      <DataTable
        title="Gestión de Etapas"
        columns={columns}
        data={stages}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStage ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
            

              <div>
              <label className="block text-sm font-medium mb-1">¿Se ganó?</label>
              <input
                type="checkbox"
                checked={formData.is_won || false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  is_won: e.target.checked
                  }))}
                
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Requerimientos</label>
                <Input
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requirements: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Secuencia</label>
                <Input
                  type='number'
                  value={formData.sequence}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sequence: parseInt(e.target.value),
                  }))}
                  required
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
                {editingStage ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 