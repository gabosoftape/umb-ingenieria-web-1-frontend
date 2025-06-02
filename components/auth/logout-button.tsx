"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth.context";
import { LogOut } from "lucide-react";
import { useState } from "react";

type LogoutButtonProps = ButtonProps & {
  showIcon?: boolean;
  text?: string;
};

/**
 * Botón de cierre de sesión que utiliza nuestro contexto de autenticación personalizado
 * para cerrar la sesión de manera sincronizada con el backend
 */
export default function LogoutButton({
  showIcon = true,
  text = "Cerrar sesión",
  ...props
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Usar nuestro contexto de autenticación personalizado
      logout();
      // No es necesario redirigir aquí, ya que la función logout ya maneja la redirección
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="ghost"
      {...props}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {isLoading ? "Cerrando sesión..." : text}
    </Button>
  );
}
