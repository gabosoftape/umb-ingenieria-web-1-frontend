"use client";

import { useAuth } from "@/providers/auth.provider";
import { useEffect } from "react";
import { useRouter } from "@/components/navigation";
import { brandConfig } from "@/lib/brand";

type ClientProtectedRouteProps = {
  children: React.ReactNode;
  locale: string;
};

/**
 * Componente que protege rutas que requieren autenticaciu00f3n.
 * Recibe el locale como prop desde el servidor para evitar usar useLocale() en el cliente.
 * Redirige al usuario a la pu00e1gina de inicio de sesiu00f3n si no estu00e1 autenticado.
 */
export default function ClientProtectedRoute({ children, locale }: ClientProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no estu00e1 cargando y no estu00e1 autenticado, redirigir al login
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}${brandConfig.mainRoute}`);
    }
  }, [isAuthenticated, loading, router, locale]);

  // Mostrar nada mientras se verifica la autenticaciu00f3n
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  // Si estu00e1 autenticado, mostrar el contenido protegido
  return isAuthenticated ? <>{children}</> : null;
}
