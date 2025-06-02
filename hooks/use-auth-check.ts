"use client";

import { useAuth } from "@/contexts/auth.context";
import { useRouter } from "@/components/navigation";
import { useEffect } from "react";
import { APP_ROUTES } from "@/lib/constants";

/**
 * Hook para verificar si un usuario está autenticado y redirigirlo si no lo está
 * @param locale - El idioma actual de la aplicación
 * @param redirectTo - La ruta a la que redirigir si el usuario no está autenticado
 */
export function useAuthCheck(locale: string, redirectTo = APP_ROUTES.LOGIN) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir al login
    if (!loading && !isAuthenticated) {
      router.push(`/${redirectTo}`);
    }
  }, [isAuthenticated, loading, router, locale, redirectTo]);

  return { isAuthenticated, loading, user };
}

/**
 * Hook para verificar si un usuario NO está autenticado y redirigirlo si lo está
 * Útil para páginas de login/registro donde no queremos que accedan usuarios ya autenticados
 * @param locale - El idioma actual de la aplicación
 * @param redirectTo - La ruta a la que redirigir si el usuario está autenticado
 */
export function useUnauthenticatedCheck(locale: string, redirectTo = APP_ROUTES.DASHBOARD) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y está autenticado, redirigir al dashboard
    if (!loading && isAuthenticated) {
      router.push(`/${locale}${redirectTo}`);
    }
  }, [isAuthenticated, loading, router, locale, redirectTo]);

  return { isAuthenticated, loading, user };
}
