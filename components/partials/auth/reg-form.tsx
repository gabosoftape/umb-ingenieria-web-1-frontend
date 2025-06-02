"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { brandConfig } from '@/lib/brand';
import { startTransition, useCallback } from "react";
import { registerUser } from '@/action/auth-action';
import { toast } from "sonner";
import { useRouter } from '@/components/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "next-intl";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
};

const RegForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<RegisterForm>();
  const router = useRouter();
  const locale = useLocale(); // Obtener el locale actual
  
  const onSubmit = useCallback((data: RegisterForm) => {
    startTransition(async () => {
      try {
        const response = await registerUser(data);
        console.log(response);
        if (!!response.error) {
          toast.error("Error al registrar usuario", {
            description: response.error,
          })
        } else {
          // Ya no necesitamos guardar el token aquí, ya que lo hace el servicio de autenticación
          // Usar el locale actual en la redirección
          // router.push(`/${locale}/dashboard/analytics`);
          toast.success("Usuario registrado exitosamente");
          reset();
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...register("name", { required: "El nombre es requerido" })}
          className="border-default-200"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder={brandConfig.email}
          {...register("email", { 
            required: "El email es requerido",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email inválido"
            }
          })}
          className="border-default-200"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          {...register("password", { 
            required: "La contraseña es requerida",
            minLength: {
              value: 6,
              message: "La contraseña debe tener al menos 6 caracteres"
            }
          })}
          className="border-default-200"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select onValueChange={(value) => setValue("role", value)} defaultValue="residente">
          <SelectTrigger className="border-default-200">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="residente">Residente</SelectItem>
            <SelectItem value="portero">Portero</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register("role", { required: "El rol es requerido" })} />
        {errors.role && (
          <p className="text-red-500 text-sm">{errors.role.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="text"
          placeholder="Teléfono"
          {...register("phone", { required: "El teléfono es requerido" })}
          className="border-default-200"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone.message}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Acepto los términos y condiciones
        </Label>
      </div>
      <Button type="submit" className="w-full">
        Registrarse
      </Button>
    </form>
  );
};

export default RegForm;
