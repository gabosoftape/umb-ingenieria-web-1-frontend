"use client"

import * as React from "react"
import { useAuth } from "@/contexts/auth.context";
import { ChevronsUpDown, Check, CirclePlus } from 'lucide-react';

import { cn } from "@/lib/utils"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useConfig } from "@/hooks/use-config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion, AnimatePresence } from "framer-motion";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { AccountRequestModel, AccountResponseModel, CreateAccountDto } from "@/services/accounts.service";
import { AccountsService } from "@/services/accounts.service";
import { useCallback, useEffect, useState } from "react";


type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface AccountSwitcherProps extends PopoverTriggerProps { }

const scaleVariants = {
    collapsed: { scale: 0.8 },
    expanded: { scale: 1 }
};

export default function AccountSwitcher({ className }: AccountSwitcherProps) {
    const [config] = useConfig();
    const [hoverConfig] = useMenuHoverConfig();
    const { account, setAccount, user } = useAuth();
    const { hovered } = hoverConfig;
    const [open, setOpen] = useState(false)
    const [showNewAccountDialog, setShowNewAccountDialog] = useState(false)
    const [accounts, setAccounts] = useState<AccountResponseModel[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState<Partial<AccountRequestModel>>({
        name: '',
        domain: '',
        parent_account_id: 1
      });

    const isDesktop = useMediaQuery("(min-width: 1280px)")
    if (config.showSwitcher === false || config.sidebar === 'compact') return null

    // Obtener la inicial del nombre para el avatar
    const userInitial = user?.name?.charAt(0) || "U";

    const fetchAccounts = useCallback( async (account_id: number) => {
        try {
            setLoading(true);
            let new_account_id = 1
            if(user && account_id == 0){
                const userAccounts = await AccountsService.getUserAccounts(user?.id!);
                if(userAccounts.data.length > 0){
                    new_account_id = userAccounts.data[0].id || 1;
                }
            }
            const response = await AccountsService.getAccounts(new_account_id);
            setAccounts(response.data);
            if (response.data.length > 0) {
                setAccount(response.data[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener las cuentas:", error);
        }
    }, []);

    useEffect(() => {
        fetchAccounts(account.id!);
    }, [account.id]);

    useEffect(() => {
         // Cargar compañías
    }, []);
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount = {
          ...formData,
          account_id: account.id,
          parent_account_id: account.id
        } as CreateAccountDto;
        
        AccountsService.createAccount(newAccount);
        alert('Cuenta creada exitosamente');
        setFormData({
            name: '',
            domain: '',
            parent_account_id: account.id
          });
        AccountsService.getAccounts(account.id!).then((accounts) => {
            console.log("getting data accounts", accounts);
            setAccounts(accounts.data);
        });
        setShowNewAccountDialog(false);
    };

    return (
        <Dialog open={showNewAccountDialog} onOpenChange={setShowNewAccountDialog}>
            <Popover open={open} onOpenChange={setOpen}>


                <PopoverTrigger asChild>



                    <motion.div
                        key={(config.collapsed && !hovered) ? "collapsed" : "expanded"}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}


                    >
                        {(config.collapsed && !hovered) ? <Button
                            variant="outline"
                            color="secondary"
                            role="combobox"
                            fullWidth
                            aria-expanded={open}
                            aria-label="Select a Account"
                            className={cn("  h-14 w-14 mx-auto  p-0 md:p-0  dark:border-secondary ring-offset-sidebar", className)}
                        >
                            <Avatar className="">
                                {user?.image ? (
                                    <AvatarImage
                                        height={24}
                                        width={24}
                                        src={user.image}
                                        alt={account.name}
                                        className="grayscale"
                                    />
                                ) : (
                                    <AvatarFallback>{userInitial}</AvatarFallback>
                                )}
                            </Avatar>
                        </Button> : <Button
                            variant="outline"
                            color="secondary"
                            role="combobox"
                            fullWidth
                            aria-expanded={open}
                            aria-label="Select a team"
                            className={cn("  h-auto py-3 md:px-3 px-3 justify-start dark:border-secondary ring-offset-sidebar", className)}
                        >
                            <div className=" flex  gap-2 flex-1 items-center">
                                <Avatar className=" flex-none h-[38px] w-[38px]">
                                    {user?.image ? (
                                        <AvatarImage
                                            height={38}
                                            width={38}
                                            src={user.image}
                                            alt={account.name}
                                            className="grayscale"
                                        />
                                    ) : (
                                        <AvatarFallback>{userInitial}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="flex-1 text-start w-[100px]">

                                    <div className=" text-sm  font-semibold text-default-900">Cuentas</div>
                                    <div className=" text-xs font-normal text-default-500 dark:text-default-700 truncate "><b>{account.name}</b></div>

                                </div>
                                <div className="">
                                    <ChevronsUpDown className="ml-auto h-5 w-5 shrink-0  text-default-500 dark:text-default-700" />
                                </div>
                            </div>
                        </Button>}
                    </motion.div>

                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder="Search account..." className=" placeholder:text-xs" />
                            <CommandEmpty>No account found.</CommandEmpty>
                            
                            <CommandGroup heading={"Cuentas Disponibles"}>
                                {accounts.map((accountData) => (
                                    <CommandItem    
                                        key={accountData.id}
                                        onSelect={() => {
                                            setAccount(accountData)
                                            setOpen(false)
                                        }}
                                        className="text-sm font-normal"
                                    >
                                        <span className="text-gray-500">{accountData.name}</span>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                accountData.id === account.id
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            
                        </CommandList>
                        <CommandSeparator />
                        {user?.role == 'sa' && <CommandList>
                            <CommandGroup>
                                <DialogTrigger asChild>
                                    <CommandItem
                                        onSelect={() => {
                                            setOpen(false)
                                            setShowNewAccountDialog(true)
                                        }}
                                        className="text-sm font-normal"
                                    >
                                        <CirclePlus className="mr-2 h-4 w-4" />
                                        Añadir Cuenta
                                    </CommandItem>
                                </DialogTrigger>
                            </CommandGroup>
                        </CommandList>}
                    </Command>
                </PopoverContent>
            </Popover>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Cuenta</DialogTitle>
                    <DialogDescription>
                        Add a new account to manage sys objects.
                    </DialogDescription>
                </DialogHeader>
                <div>
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
                            <div>
                            <label className="block text-sm font-medium mb-1">Cuenta Padre</label>
                            <Select 
                                onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    parent_account_id: Number(value)
                                }))} 
                                defaultValue={formData.parent_account_id?.toString()}>
                                
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account..." />
                                </SelectTrigger>
                                
                                <SelectContent>
                                {
                                    accounts.map((accountSelection) =>
                                    <SelectItem
                                        key={`account-${accountSelection.id}`}
                                        value={accountSelection.id.toString()}>
                                        <div className="flex items-center gap-2">
                                           <span className="text-sm text-default-900">{accountSelection.name}</span>
                                        </div>
                                    </SelectItem>)
                                }
                                </SelectContent>
                            </Select>
                            </div>
                            
                        </div>
            
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowNewAccountDialog(false)}
                            >
                            Cancelar
                            </Button>
                            <Button type="submit">
                            { 'Crear'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
