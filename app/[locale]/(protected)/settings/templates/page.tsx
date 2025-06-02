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
import { useAuth } from '@/contexts/auth.context';
import { GeneralTemplateDto, TemplateResponseModel, BlogsService } from '@/services/blogs.service';
import { TemplateVisualizer } from '@/components/template/TemplateVisualizer';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from '@/components/navigation';

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'active', label: 'Activo' },
  { key: 'workflow_id', label: 'Workflow ID' },
  { key: 'account_id', label: 'Cuenta ID' },
  { key: 'id', label: 'ID' },
  { key: 'created_at', label: 'Creado' },
  { key: 'updated_at', label: 'Actualizado' },
  { key: 'nodes', label: 'Nodos', render: (value: string) => <span className="length">{JSON.parse(value).length}</span> }
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateResponseModel[]>([]);
  const {account, user} = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GeneralTemplateDto | null>(null);
  const [formData, setFormData] = useState<Partial<GeneralTemplateDto>>({
    name: '',
    active: false,
    nodes: '',
    account_id: 0,
    workflow_id: ''
  });
  
  const [viewingTemplate, setViewingTemplate] = useState<TemplateResponseModel | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'visualizer'>('list');
  const [updatedNodes, setUpdatedNodes] = useState<any[]>([]);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<{ id: string; index: number } | null>(null);
  const [nodeJson, setNodeJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(user?.role);
    if(user && user?.role !== 'sa' && user?.role !== 'admin'){
      router.push("/dashboard/analytics");
      console.log("redirigiendo....");
    }
  }, [user?.role]);
  
  const handleAdd = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      active: false,
      nodes: '',
      account_id: 0,
      workflow_id: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (template: GeneralTemplateDto) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      active: template.active,
      nodes: template.nodes,
      account_id: template.account_id,
      workflow_id: template.workflow_id
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (template: GeneralTemplateDto) => {
    if (window.confirm('¿Está seguro de que desea eliminar este template?')) {
      // cambiar a borrar en servidor ... 
      BlogsService.deleteTemplate(template.id!);
      fetchTemplates(account.id!);
      alert('Template eliminado exitosamente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTemplate) {
      // enviar este template editado al servidor
      // Actualizar template existente
      console.log("Identification ?", formData, editingTemplate.id);
      const editData: Partial<GeneralTemplateDto> = formData;  
      editData.id = editingTemplate.id;
      BlogsService.updateTemplate(editData, account.id!);
      alert('Template actualizado exitosamente');
    } else {
      // enviar al servidor nuevo template
      // Crear nuevo template
      const newTemplate = {
        ...formData,
        id: "",
        account_id: account.id!
      } as GeneralTemplateDto;
      
      BlogsService.createTemplate(newTemplate);
      
      alert('Template creado exitosamente');
    }
    fetchTemplates(account.id!);
    setIsModalOpen(true);
  };

  const fetchTemplates = async (account_id: number) => {
    setLoading(true);
    try {
      const templatesData = await BlogsService.getTemplates(account_id);
      console.log("getting data templates", templatesData);
      setTemplates(templatesData);
      
      // Si hay un ID de template en la URL, buscar y mostrar ese template
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get('template');
        
        if (templateId && templatesData.length > 0) {
          const foundTemplate = templatesData.find(t => t.id === templateId);
          if (foundTemplate) {
            handleViewTemplate(foundTemplate);
            // Limpiar el paru00e1metro de la URL sin recargar la pu00e1gina
            const url = new URL(window.location.href);
            url.searchParams.delete('template');
            window.history.replaceState({}, '', url.toString());
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account.id) {
      fetchTemplates(account.id);
    }
  }, [account.id]);

  const handleViewTemplate = (template: TemplateResponseModel) => {
      setViewingTemplate(template);
      if (template.nodes) {
        try {
          const parsedNodes = JSON.parse(template.nodes);
          setUpdatedNodes(parsedNodes);
        } catch (err) {
          console.error('Error al parsear los nodos:', err);
          setUpdatedNodes([]);
        }
      } else {
        setUpdatedNodes([]);
      }
      setIsModalOpen(true);
    };
  
    const handleCloseView = () => {
      setViewingTemplate(null);
      setIsModalOpen(false);
      setViewMode('list');
    };
  
    const handleEditNode = (node: any, index: number) => {
      setEditingNode({ ...node, index });
      setNodeJson(JSON.stringify(node, null, 2));
      setIsJsonModalOpen(true);
    };
  
    const handleSaveNodeJson = async () => {
      try {
        const updatedNode = JSON.parse(nodeJson);
        if (editingNode && viewingTemplate) {
          // Actualizar el nodo en el array local
          const newNodes = [...updatedNodes];
          newNodes[editingNode.index] = updatedNode;
          setUpdatedNodes(newNodes);
          
          // Actualizar en la base de datos
          const templateData = {
            id: viewingTemplate.id,
            nodes: JSON.stringify(newNodes)
          };
          
          await BlogsService.updateTemplate(templateData, account.id || 1);
          setIsJsonModalOpen(false);
          alert('Nodo actualizado exitosamente');
        }
      } catch (err) {
        alert('JSON invu00e1lido. Por favor verifica el formato.');
      }
    };
  
    const handleSaveAllChanges = async () => {
      if (viewingTemplate && account.id) {
        try {
          const templateData = {
            id: viewingTemplate.id,
            nodes: JSON.stringify(updatedNodes)
          };
          
          await BlogsService.updateTemplate(templateData, account.id);
          alert('Template actualizado exitosamente');
          fetchTemplates(account.id!);
        } catch (err: any) {
          alert(err.message || 'Error al actualizar el template');
        }
      }
    };
  
    const toggleViewMode = () => {
      setViewMode(prev => prev === 'list' ? 'visualizer' : 'list');
    };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Gestión de Templates</h2>
        <p className="text-gray-600">Los templates se crean automu00e1ticamente a partir de workflows locales.</p>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : (
          <DataTable
            title="Gestión de Templates"
            columns={columns}
            data={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleViewTemplate}
          />
        )}
      </div>
      

      {/* Modal para ver detalles del template */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {viewingTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          {viewingTemplate && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="font-semibold">ID:</span> {viewingTemplate.id}
                </div>
                <div>
                  <span className="font-semibold">Activo:</span> {viewingTemplate.active ? 'Sí' : 'No'}
                </div>
                <div>
                  <span className="font-semibold">ID de Workflow:</span> {viewingTemplate.workflow_id}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Nodos HTTP Request</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleViewMode}
                >
                  {viewMode === 'list' ? 'Ver como diagrama' : 'Ver como lista'}
                </Button>
              </div>

              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {updatedNodes.length > 0 ? (
                    updatedNodes.map((node: any, index: number) => (
                      <div key={node.id || index} className="border rounded-md p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{node.name || `Nodo ${index + 1}`}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditNode(node, index)}
                          >
                            Editar JSON
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">ID:</span> {node.id || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold">Tipo:</span> {node.type || 'N/A'}
                          </div>
                          {node.parameters && node.parameters.url && (
                            <div className="col-span-2">
                              <span className="font-semibold">URL:</span> {node.parameters.url}
                            </div>
                          )}
                          {node.parameters && node.parameters.method && (
                            <div>
                              <span className="font-semibold">Método:</span> {node.parameters.method}
                            </div>
                          )}
                          {node.parameters && node.parameters.authentication && (
                            <div>
                              <span className="font-semibold">Autenticación:</span> {node.parameters.authentication}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">No hay nodos HTTP Request en este template</div>
                  )}
                </div>
              ) : (
                <div className="border rounded-md p-4 bg-gray-50">
                  <TemplateVisualizer 
                    nodes={updatedNodes} 
                    onNodeEdit={handleEditNode} 
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseView}
                  size="sm"
                >
                  Cerrar
                </Button>
                {updatedNodes.length > 0 && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleSaveAllChanges}
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Guardar Todos los Cambios
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para editar JSON del nodo */}
      <Dialog open={isJsonModalOpen} onOpenChange={setIsJsonModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Editar Nodo: {editingNode?.index || 'Unknown Index'}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <Textarea
              className="font-mono text-sm h-96"
              value={nodeJson}
              onChange={(e) => setNodeJson(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsJsonModalOpen(false)}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleSaveNodeJson}
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
