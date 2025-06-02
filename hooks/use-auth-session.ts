"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/components/navigation";
import { useAuth } from "@/contexts/auth.context";
import { User } from "@/services/auth.service";

/**
 * Hook personalizado para acceder a la sesión de autenticación
 * y proporcionar funciones útiles relacionadas con la autenticación
 * 
 * NOTA: Este hook es un wrapper alrededor de useAuth para mantener
 * compatibilidad con el código existente que utilizaba useAuthSession
 */
export function useAuthSession() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [session, setSession] = useState<{ user: User | null } | null>(null);
  const router = useRouter();
  
  // Actualizar el estado local cuando cambia el usuario en el contexto de autenticación
  useEffect(() => {
    if (user) {
      setSession({ user });
    } else {
      setSession(null);
    }
  }, [user]);

  // Función para obtener el token de API (ahora desde localStorage)
  const getApiToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  };

  // Función para redirigir al usuario si no está autenticado
  const requireAuth = (callback?: () => void) => {
    if (!isAuthenticated && !loading) {
      router.push("/auth/login");
    } else if (callback && isAuthenticated) {
      callback();
    }
  };

  return {
    session,
    loading,
    isAuthenticated,
    getApiToken,
    logout,
    requireAuth,
  };
}
