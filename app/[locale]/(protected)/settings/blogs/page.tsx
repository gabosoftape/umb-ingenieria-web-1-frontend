'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/data-table/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth.context';
import {GeneralBlogDto, BlogsService, BlogResponseModel} from '@/services/blogs.service';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from '@/components/navigation';
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {UserRequestModel} from "@/services/users.service";

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'description', label: 'Description' },
  { key: 'text', label: 'Texto' },
];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogResponseModel[]>([]);
  const {account, user} = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<GeneralBlogDto | null>(null);
  const [formData, setFormData] = useState<Partial<GeneralBlogDto>>({
    name: '',
    description: '',
    text: '',
    account_id: account.id!,
  });
  const [viewingBlog, setViewingBlog] = useState<BlogResponseModel | null>(null);
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
    setEditingBlog(null);
    setFormData({
      name: '',
      description: '',
      text: '',
      account_id: account.id!,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (blog: GeneralBlogDto) => {
    setEditingBlog(blog);
    setFormData({
      name: blog.name,
      description: blog.description,
      text: blog.text,
      account_id: blog.account_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (template: GeneralBlogDto) => {
    if (window.confirm('¿Está seguro de que desea eliminar este template?')) {
      // cambiar a borrar en servidor ... 
      BlogsService.deleteBlog(template.id!);
      fetchBlogs(account.id!);
      alert('Blog eliminado exitosamente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBlog) {
      // enviar este template editado al servidor
      // Actualizar template existente
      console.log("Identification ?", formData, editingBlog.id);
      const editData: Partial<GeneralBlogDto> = formData;  
      editData.id = editingBlog.id;
      BlogsService.updateBlog(editData, account.id!);
      alert('Blog actualizado exitosamente');
    } else {
      // enviar al servidor nuevo template
      // Crear nuevo template
      const newBlog = {
        ...formData,
        id: "",
        account_id: account.id!
      } as GeneralBlogDto;
      
      BlogsService.createBlog(newBlog);
      
      alert('Blog creado exitosamente');
    }
    await fetchBlogs(account.id!);
    setIsModalOpen(false);
  };

  const fetchBlogs = async (account_id: number) => {
    setLoading(true);
    try {
      const templatesData = await BlogsService.getBlogs(account_id);
      console.log("getting data templates", templatesData);
      setBlogs(templatesData);
      
      // Si hay un ID de template en la URL, buscar y mostrar ese template
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get('template');
        
        if (templateId && templatesData.length > 0) {
          const foundBlog = templatesData.find(t => t.id === templateId);
          if (foundBlog) {
            handleViewBlog(foundBlog);
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
      fetchBlogs(account.id);
    }
  }, [account.id]);

  const handleViewBlog = (template: BlogResponseModel) => {
      setViewingBlog(template);

      setIsModalOpen(true);
    };
  
    const handleCloseView = () => {
      setViewingBlog(null);
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
        if (editingNode && viewingBlog) {
          // Actualizar el nodo en el array local
          const newNodes = [...updatedNodes];
          newNodes[editingNode.index] = updatedNode;
          setUpdatedNodes(newNodes);
          
          // Actualizar en la base de datos
          const templateData = {
            id: viewingBlog.id,
            nodes: JSON.stringify(newNodes)
          };
          
          await BlogsService.updateBlog(templateData, account.id || 1);
          setIsJsonModalOpen(false);
          alert('Nodo actualizado exitosamente');
        }
      } catch (err) {
        alert('JSON invu00e1lido. Por favor verifica el formato.');
      }
    };
  
    const handleSaveAllChanges = async () => {
      if (viewingBlog && account.id) {
        try {
          const templateData = {
            id: viewingBlog.id,
            nodes: JSON.stringify(updatedNodes)
          };
          
          await BlogsService.updateBlog(templateData, account.id);
          alert('Blog actualizado exitosamente');
          fetchBlogs(account.id!);
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
        <h2 className="text-2xl font-bold mb-2">Gestión de Blogs</h2>
        <p className="text-gray-600">Gestiona los blogs .</p>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : (
          <DataTable
            title="Blogs"
            columns={columns}
            data={blogs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        )}
      </div>



      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBlog ? 'Editar Blog' : 'Crear Nuevo Blog'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                    name={'name'}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                    name={'description'}
                    type="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Texto</label>
                <textarea
                    name={'text'}
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      text: e.target.value
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
                {editingBlog ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
