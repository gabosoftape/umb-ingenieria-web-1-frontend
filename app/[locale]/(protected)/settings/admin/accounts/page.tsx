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
import { AccountRequestModel, AccountResponseModel, AccountsService, CreateAccountDto } from '@/services/accounts.service';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from '@/components/navigation';



export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountResponseModel[]>([]);
  const { account, user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountResponseModel | null>(null);
  const [formData, setFormData] = useState<Partial<AccountRequestModel>>({
    name: '',
    domain: '',
    parent_account_id: 1,
    company_id: ""
  });


  function getAccountName(value: number): React.ReactNode {
    const existAccount = accounts.find(c => c.id == value);
    if(existAccount){
      return existAccount.name;
    }
    return "Sin Asignar";
  }

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'domain', label: 'Email' },
    {
      key: 'parent_account_id',
      label: 'Cuenta Padre',
      render: (value: number) => (
        <Badge className={
          value != null ? 'bg-green-500' :
          'bg-red-500'
        }>
          {getAccountName(value)}
        </Badge>
      ),
    }
  ];

  const handleAdd = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      domain: '',
      parent_account_id: account.id!,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (account: AccountResponseModel) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      domain: account.domain,
      parent_account_id: account.parent_account_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (account: AccountResponseModel) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta cuenta?')) {

      // cambiar a borrar en servidor ... 
      if(account.id){
        AccountsService.deleteAccount(account.id);
        AccountsService.getAccounts(account.id!).then((accounts) => {
          console.log("getting data accounts", accounts);
          setAccounts(accounts.data);
        })
        alert('Cuenta eliminada exitosamente');
      }else{
        alert('Error, no existe id en data account');
      }
      
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccount) {
      // enviar este usuario editado al servidor
      // Actualizar usuario existente
      console.log("Identification ?", formData, editingAccount.id);
      const editData: Partial<AccountRequestModel> = formData;  
      editData.id = editingAccount.id;
      AccountsService.updateAccount(editData);
      alert('Cuenta actualizada exitosamente');
    } else {
      // enviar al servidor nuevo account
      // Crear nueva cuenta
      const newAccount = {
        ...formData,
        account_id: account.id!
      } as CreateAccountDto;
      
      AccountsService.createAccount(newAccount);
      alert('Cuenta creada exitosamente');
    }
    AccountsService.getAccounts(account.id!).then((accounts) => {
      console.log("getting data accounts", accounts);
      setAccounts(accounts.data);
    })
    setIsModalOpen(false);
  };

  useEffect(()=> {
    // Cargar cuentas
    AccountsService.getAccounts(account.id!).then((accounts) => {
      console.log("getting data accounts", accounts);
      setAccounts(accounts.data);
    });
  }, [account.id]);


  useEffect(() => {
    console.log(user?.role);
    if(user && user?.role !== 'sa' && user?.role !== 'admin'){
      router.push("/dashboard/analytics");
      console.log("redirigiendo....");
    }
  }, [user?.role]);

  return (
    <div className="container mx-auto p-6">
      <DataTable
        title="Gestión de Cuentas"
        columns={columns}
        data={accounts}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}
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
                <label className="block text-sm font-medium mb-1">Dominio</label>
                <Input
                  type="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domain: e.target.value
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
                {editingAccount ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 


