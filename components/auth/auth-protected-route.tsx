"use client";

import { useEffect } from "react";
import { useRouter } from "@/components/navigation";
import { useAuth } from "@/contexts/auth.context";
import { APP_ROUTES } from "@/lib/constants";

type AuthProtectedRouteProps = {
  children: React.ReactNode;
  locale: string;
};

/**
 * Componente que protege rutas que requieren autenticaciu00f3n.
 * Utiliza el contexto de autenticaciu00f3n personalizado en lugar de Next Auth.
 */
export default function AuthProtectedRoute({ children, locale }: AuthProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no estu00e1 cargando y no estu00e1 autenticado, redirigir al login
    if (!loading && !isAuthenticated) {
      router.push(`/${APP_ROUTES.LOGIN}`);
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
