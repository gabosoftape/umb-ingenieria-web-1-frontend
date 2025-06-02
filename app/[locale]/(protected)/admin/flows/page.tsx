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
import {  Flow, FlowsService } from '@/services/flows.service';
import { useAuth } from '@/contexts/auth.context';
import { TemplateSelector } from '@/components/admin/template-selector';
import { TemplateNodeViewer } from '@/components/admin/template-node-viewer';
import { WhatsappNumbersService, WhatsappNumber } from '@/services/whatsapp.numbers.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateResponseModel, BlogsService } from '@/services/blogs.service';



export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [templates, setTemplates] = useState<TemplateResponseModel[]>([]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsappNumber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null);
  const {account, user} = useAuth();
  
  const columns = [
    { key: 'name', label: 'name' },
    { key: 'description', label: 'description' },
    { key: 'template_id', label: 'Template', render: (value: string) => (
        <Badge className={'bg-green-500'}>
          {getTenmplateName(value)}
        </Badge>
      ),
    },
    { key: 'whatsapp_number_id', label: 'whatsapp_number_id' },
    { key: 'isActive', label: 'isActive', render: (value: boolean) => (
        <Badge className={
          value ? 'bg-green-500' :
          'bg-red-500'
        }>
          {value ? "Si" : "No"}
        </Badge>
      ),
    },
    { key: 'syncStatus', label: 'Estado de sincronizacion', render: (value: string) => (
        <Badge className={
          value === 'synchronized' ? 'bg-green-500' :
          'bg-red-500'
        }>
          {value === 'synchronized' ? "Sincronizado" : "Pendiente"}
        </Badge>
      ),
    },
    { key: 'lastSyncAt', label: 'Ultima sincronizacion', render: (value: string) => (
        <Badge className={
          value ? 'bg-green-500' :
          'bg-red-500'
        }>
          {value ? new Date(value).toLocaleString() : "No"}
        </Badge>
      ),
    }
  ];

  const [formData, setFormData] = useState<Partial<Flow>>({
    name: '',
    description: '',
    template_id: '',
    whatsapp_number_id: '',
    isActive: false,
    syncStatus: '',
    syncError: '',
    account_id: 0,
    nodes: '',
  });


  const handleAdd = () => {
    setEditingFlow(null);
    setFormData({
      name: '',
      description: '',
      template_id: '',
      whatsapp_number_id: '',
      isActive: false,
      syncStatus: '',
      syncError: '',
      account_id: 0,
      nodes: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (flow: Flow) => {
    setEditingFlow(flow);
    setFormData({
      id: flow.id,
      name: flow.name,
      description: flow.description,
      template_id: flow.template_id,
      whatsapp_number_id: flow.whatsapp_number_id,
      isActive: flow.isActive,
      syncStatus: flow.syncStatus,
      syncError: flow.syncError,
      account_id: flow.account_id,
      nodes: flow.nodes,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (flow: Flow) => {
    if (window.confirm('¿Está seguro de que desea eliminar este flow?')) {
      const resp = await FlowsService.deleteFlow(flow.id);
      console.log(resp);
      FlowsService.getFlows(account.id!).then((flowsData: Flow[]) => {
        setFlows(flowsData);
      });
      alert('Flow eliminado exitosamente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFlow) {
        // Actualizar flow existente
        const resp = await FlowsService.updateFlow(formData);
        console.log(resp);
        alert('Flow actualizado exitosamente');
      } else {
        // Crear nuevo flow
        const newFlow = {
          ...formData,
          account_id: account.id,
        } as unknown as Flow;
        const resp = await FlowsService.createFlow(newFlow);
        console.log(resp);
        alert('Flow creado exitosamente');
      }
      FlowsService.getFlows(account.id!).then((flowsData: Flow[]) => {
        setFlows(flowsData);
      });
      setIsModalOpen(false);
    } catch (error: any) {
      if (error.message.includes('ADVERTENCIA')) {
        if (window.confirm(error.message)) {
          // Si el usuario confirma, proceder con la actualización
          const resp = await FlowsService.updateFlow(formData);
          console.log(resp);
          alert('Flow actualizado exitosamente');
          FlowsService.getFlows(account.id!).then((flowsData: Flow[]) => {
            setFlows(flowsData);
          });
          setIsModalOpen(false);
        }
      } else {
        alert('Error: ' + error.message);
      }
    }
  };

  useEffect(()=> {
    // get Data flow
    FlowsService.getFlows(account.id!).then((flowsData: Flow[]) => {
      console.log(flowsData);
      setFlows(flowsData);
    });

    // Cargar números de WhatsApp
    WhatsappNumbersService.getWhatsappNumbers().then((numbers) => {
      setWhatsappNumbers(numbers);
    });

    BlogsService.getTemplates(account.id!).then((templatesData) => {
      setTemplates(templatesData);
    });;
    
  }, [account.id]);

  function getTenmplateName(template_id: string){
    let defaultName = 'Sin nombre';
    const template = templates.filter((data) => data.id == template_id);
    if(template.length == 0){
      return defaultName;
    }
    return template[0].name;
  }


  const handleSyncEvent = () => {
    if(editingFlow?.syncStatus != "synchronized" ){
      FlowsService.syncFlow(editingFlow!.id).then((flow: Flow) => {
        console.log("respuesta sync flow: ", flow);
        setEditingFlow(flow);
        setFormData({
          id: flow.id,
          name: flow.name,
          description: flow.description,
          template_id: flow.template_id,
          whatsapp_number_id: flow.whatsapp_number_id,
          isActive: flow.isActive,
          syncStatus: flow.syncStatus,
          syncError: flow.syncError,
          account_id: flow.account_id,
          nodes: flow.nodes,
        });
      });
      
    }else{
      alert("not implemented bro!");
      setIsModalOpen(false);
    }
    FlowsService.getFlows(account.id!).then((flowsData: Flow[]) => {
      setFlows(flowsData);
    });
  };

  return (
    <div className="container mx-auto p-6">
      <DataTable
        title="Gestión de Flujos"
        columns={columns}
        data={flows}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent style={{ width: '70vw', maxWidth: '70vw' }} className="h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className='flex flex-row gap-3'>
              {editingFlow ? 'Editar Flow' : 'Crear Nuevo Flow'} 
              {editingFlow && <Badge className={`p-2 relative bottom-2 ${formData.isActive ? 'bg-green-500': 'bg-gray-500'}`}>
                <input
                  disabled={user?.role != 'admin' ? true : false}
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    isActive: e.target.checked
                  }))}
                />
                <label htmlFor="isActive" className="pl-2 text-xs font-xs">{formData.isActive ? 'Activo': 'Inactivo'}</label>
              </Badge>}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h3 className="text-lg font-medium">Información del Flow</h3>
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
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Template</label>
                  <TemplateSelector
                    accountId={account.id!}
                    value={formData.template_id}
                    onChange={(value) => {
                      console.log(`Flujos: Template seleccionado: ${value}`);
                      setFormData(prev => ({
                        ...prev,
                        template_id: value
                      }))
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Número de WhatsApp</label>
                  <Select 
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      whatsapp_number_id: value
                    }))} 
                    defaultValue={formData.whatsapp_number_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar número..." />
                    </SelectTrigger>
                    
                    <SelectContent>
                      {whatsappNumbers.map((number) => (
                        <SelectItem
                          key={`whatsapp-${number.phone_number_id}`}
                          value={number.phone_number_id}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-default-900">
                              {number.display_phone_number}
                              {!number.is_active && (
                                <span className="ml-2 text-xs text-red-500">(Inactivo)</span>
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                { editingFlow && <div className="mt-2 text-xs text-gray-500 p-2 bg-gray-50 rounded-md">
                  <div className="text-lg font-bold">Información de sincronizacion:</div>
                  {editingFlow.external_workflow_id && (
                    <div className='flex flex-col gap-2 mt-4'>
                      <span><b>external Workflow ID: </b>{editingFlow.external_workflow_id}</span>
                      <span><b>sync Workflow status: </b>{editingFlow.syncStatus}</span>
                    </div>
                  )}
                  {!editingFlow.external_workflow_id && <Button
                    type="button"
                    variant="outline"
                    className='mt-4'
                    onClick={() => handleSyncEvent()}
                  >
                    {editingFlow?.syncStatus == "synchronized" ? "Deshabilitar" : "Sincronizar"}
                  </Button>}
                </div>}
              </div>
              
              <div className="space-y-5">
                <h3 className="text-lg font-medium">Visualización de Nodos</h3>
                <div className="h-full">
                  {editingFlow ? (
                    <TemplateNodeViewer 
                      templateId={null} 
                      nodes={formData.nodes} 
                      onNodesChange={(nodes) => setFormData(prev => ({
                        ...prev,
                        nodes
                      }))}
                    />
                  ) : (
                    <TemplateNodeViewer templateId={formData.template_id || null} />
                  )}
                  {formData.template_id && (
                    <div className="mt-2 text-xs text-gray-500 p-2 bg-gray-50 rounded-md">
                      <div className="font-medium">Información de Depuración:</div>
                      <div>Template ID: {formData.template_id}</div>
                      {formData.account_id && <div>Account ID: {formData.account_id}</div>}
                    </div>
                  )}
                </div>
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
                {editingFlow ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 