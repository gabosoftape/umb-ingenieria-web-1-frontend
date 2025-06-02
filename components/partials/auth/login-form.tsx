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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "@/components/navigation";
import { startTransition } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth.context";
import { APP_ROUTES } from "@/lib/constants";

// Esquema de validación para el formulario de login
const loginSchema = z.object({
  email: z.string().email("Ingresa un email vu00e1lido").min(1, "El email es requerido"),
  password: z.string().min(6, "La contraseuña debe tener al menos 6 caracteres"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  locale: string;
};

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const [isVisible, setIsVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Usar nuestro contexto de autenticación personalizado
      const response = await login(data.email, data.password);
      
      // Si llegamos aqu00ed, el login fue exitoso
      toast.success("Inicio de sesión exitoso");
      
      // Redireccionar al dashboard con el locale correcto
      router.push(`/${APP_ROUTES.DASHBOARD}`);
    } catch (err: any) {
      toast.error("Fallaron las credenciales, intente de nuevo", {
        description: err.message || "Verifica tus datos e intentalo nuevamente",
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
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-default-600">Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Ingresa tu contraseña"
                    type={isVisible ? "text" : "password"}
                    {...field}
                    className="border-default-200"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
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

        <div className="flex justify-between">
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex gap-2 items-center">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm text-default-600">
                  Recordarme
                </FormLabel>
              </FormItem>
            )}
          />
          <a
            href={`/${locale}/auth/forgot-password`}
            className="text-sm text-primary-500 hover:text-primary-600"
          >
            Olvidaste tu contraseña?
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </form>
    </Form>
  );
}
