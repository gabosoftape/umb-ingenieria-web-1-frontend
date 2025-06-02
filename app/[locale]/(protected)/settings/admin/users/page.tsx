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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditUserDto, UserRequestModel, UsersService } from '@/services/users.service';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from '@/components/navigation';
import { Checkbox } from "@/components/ui/checkbox";
import { AccountsService } from '@/services/accounts.service';

interface AccountPermission {
  id: number;
  name: string;
  isAllowed: boolean;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserRequestModel[]>([]);
  const {account, user} = useAuth();
  const router = useRouter();
  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    {
      key: 'user_type',
      label: 'Tipo',
      render: (value: string) => (
        <Badge className={
          value === 'admin' ? 'bg-purple-500' :
          value === 'user' ? 'bg-blue-500' :
          'bg-green-500'
        }>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    { key: 'phone', label: 'Teléfono' },
    { key: 'identification', label: 'Identificacion' }
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRequestModel | null>(null);
  const [formData, setFormData] = useState<Partial<UserRequestModel>>({
    name: '',
    email: '',
    user_type: 'admin',
    phone: "",
    identification: ''
  });
  const [availableAccounts, setAvailableAccounts] = useState<AccountPermission[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      user_type: 'admin',
      phone: "",
      identification: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserRequestModel) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      phone: user.phone,
      identification: user.identification
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (user: UserRequestModel) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      // cambiar a borrar en servidor ... 
      UsersService.deleteUser(user.id, account.id!);
      fetchUsers(account.id!);
      alert('Usuario eliminado exitosamente');
    }
  };

  const handleUpdatePassword = async (user: UserRequestModel) => {
    const newPassword = prompt('Ingrese la nueva contraseña:');
    if (!newPassword) return;
    const userId = user.id;
    try {
        const response = await fetch('/api/v1/auth/update-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                password: newPassword
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Contraseña actualizada exitosamente');
        } else {
            alert('Error al actualizar la contraseña: ' + data.message);
        }
      } catch (error) {
          alert('Error al actualizar la contraseña');
          console.error(error);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // enviar este usuario editado al servidor
      // Actualizar usuario existente
      console.log("Identification ?", formData, editingUser.id);
      const editData: Partial<UserRequestModel> = formData;  
      editData.id = editingUser.id;
      UsersService.updateUser(editData, account.id!);
      alert('Usuario actualizado exitosamente');
    } else {
      // enviar al servidor nuevo usuarios
      // Crear nuevo usuario
      const newUser = {
        ...formData,
        id: "",
      } as UserRequestModel;
      
      UsersService.createUser(newUser, account.id!);
      
      alert('Usuario creado exitosamente');
    }
    fetchUsers(account.id!);
    setIsModalOpen(false);
  };

  const fetchUsers = (account_id: number) => {
    UsersService.getUsers(account_id).then((users) => {
      console.log("getting data users", users);
      setUsers(users.data);
    });
  }

  useEffect(()=> {
    // preguntarle al servidor si el usuario que esta en el cliente puede ver usuarios.
    // get Data users
    // getAllUsers().then(() => console.log("fuck!"));
    fetchUsers(account.id!);
  }, [account]);

  useEffect(() => {
    console.log(user?.role);
    if(user && user?.role !== 'sa' && user?.role !== 'admin'){
      router.push("/dashboard/analytics");
      console.log("redirigiendo....");
    }
  }, [user?.role]);

  const handleConfig = async (user: UserRequestModel) => {
    console.log("Config click ->", user);
    setEditingUser(user);
    // Aquí deberías cargar las cuentas disponibles y las cuentas permitidas del usuario
    try {
      const accounts = await AccountsService.getAccounts(account.id!);
      const userAccounts = await AccountsService.getUserAccounts(user.id);
      setAvailableAccounts(accounts.data.map(acc => ({
        ...acc,
        isAllowed: userAccounts.data.some(ua => ua.id === acc.id)
      })));
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
    setIsAccountModalOpen(true);
  };

  const handleAccountPermissionChange = (accountId: number, isAllowed: boolean) => {
    setAvailableAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId ? { ...acc, isAllowed } : acc
      )
    );
  };

  const handleSaveAccountPermissions = async () => {
    if (!editingUser) return;
    
    try {
      const allowedAccounts = availableAccounts
        .filter(acc => acc.isAllowed)
        .map(acc => acc.id);
      
      let res = await AccountsService.updateUserAccounts(editingUser.id, allowedAccounts);
      console.log(res);
      alert('Permisos de cuenta actualizados exitosamente');
      setIsAccountModalOpen(false);
    } catch (error) {
      console.error("Error saving account permissions:", error);
      alert('Error al actualizar los permisos de cuenta');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <DataTable
        title="Gestión de Usuarios"
        columns={columns}
        data={users}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSecurity={handleUpdatePassword}
        onConfig={handleConfig}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Identification</label>
                <Input
                  type="number"
                  value={formData.identification}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    identification: e.target.value
                  }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <Select
                  value={formData.user_type}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    user_type: value as UserRequestModel['user_type']
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    phone: e.target.value
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
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Configurar Cuentas Permitidas
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto">
              {availableAccounts.map((account) => (
                <div key={account.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id={`account-${account.id}`}
                    checked={account.isAllowed}
                    onCheckedChange={(checked) => 
                      handleAccountPermissionChange(account.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`account-${account.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {account.name}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAccountModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveAccountPermissions}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 