"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "@/components/navigation";
import { startTransition } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth.context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_ROUTES } from "@/lib/constants";

// Esquema de validación para el formulario de registro
const registerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "La confirmación de contraseña debe tener al menos 6 caracteres"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").optional(),
  role: z.string().min(1, "El rol es requerido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  locale: string;
};

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "",
    },
  });

  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Usar nuestro contexto de autenticación personalizado
      await registerUser(
        data.name,
        data.email,
        data.password,
        data.phone || "",
        data.role,
      );
      
      // Si llegamos aquí, el registro fue exitoso
      toast.success("Registro exitoso");
      
      // Redireccionar al dashboard con el locale correcto
      // router.push(`/${APP_ROUTES.DASHBOARD}`);
    } catch (err: any) {
      toast.error("Error al registrar usuario", {
        description: err.message || "Verifica tus datos e inténtalo nuevamente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 2xl:mt-7 space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-default-600">Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre completo"
                  {...field}
                  className="border-default-200"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-default-600">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="ejemplo@correo.com"
                  {...field}
                  className="border-default-200"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-default-600">Teléfono</FormLabel>
              <FormControl>
                <Input
                  placeholder="Número de teléfono"
                  {...field}
                  className="border-default-200"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-default-600">Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Ingresa tu contraseña"
                    type={isPasswordVisible ? "text" : "password"}
                    {...field}
                    className="border-default-200"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {isPasswordVisible ? (
                      <EyeOffIcon className="h-5 w-5 text-default-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-default-400" />
                    )}
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-default-600">Confirmar contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Confirma tu contraseña"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    {...field}
                    className="border-default-200"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOffIcon className="h-5 w-5 text-default-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-default-400" />
                    )}
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-default-600">Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrarse"}
        </Button>
      </form>
    </Form>
  );
}
