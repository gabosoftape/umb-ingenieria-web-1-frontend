import { ProfileCard } from "@/components/user/profile-card";
import { headers } from "next/headers";
import { brandConfig } from "@/lib/brand";

export default async function UserProfilePage() {
  // Obtener el locale de los headers
  const headersList = await headers();
  const locale = headersList.get('X-NEXT-INTL-LOCALE') || brandConfig.defaultLocale;
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
        <p className="text-muted-foreground">Visualiza y administra tu información personal</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ProfileCard locale={locale} />
        </div>
        
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
              <div className="text-muted-foreground">
                <p>No hay actividad reciente para mostrar.</p>
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Total de eventos</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Eventos pendientes</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
