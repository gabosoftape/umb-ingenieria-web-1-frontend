"use client";

import { useAuth } from "@/contexts/auth.context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/components/navigation";
import { APP_ROUTES } from "@/lib/constants";

type ProfileCardProps = {
  locale: string;
};

export function ProfileCard({ locale }: ProfileCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Obtener la inicial del nombre para el avatar
  const userInitial = user?.name?.charAt(0) || "U";
  
  // Función para obtener el color de la insignia según el rol
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-500 hover:bg-red-600";
      case "guard":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-green-500 hover:bg-green-600";
    }
  };
  
  // Función para obtener el texto del rol en español
  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "Administrador";
      case "guard":
        return "Guardia";
      default:
        return "Usuario";
    }
  };
  
  const handleEditProfile = () => {
    router.push(`/${locale}/user-profile/edit`);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4">
          {user?.image ? (
            <AvatarImage src={user.image} alt={user.name} />
          ) : (
            <AvatarFallback className="text-xl bg-primary text-white">
              {userInitial}
            </AvatarFallback>
          )}
        </Avatar>
        <CardTitle className="text-2xl">{user?.name}</CardTitle>
        <CardDescription className="text-center">
          <div className="mb-2">{user?.email}</div>
          {user?.phone && <div className="mb-2">{user?.phone}</div>}
          {user?.role && (
            <Badge className={`${getRoleBadgeColor(user.role)} mt-2`}>
              {getRoleText(user.role)}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm text-muted-foreground">ID de Usuario</div>
              <div className="font-medium truncate">{user?.id}</div>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Rol</div>
              <div className="font-medium">{getRoleText(user?.role || "user")}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleEditProfile} className="w-full">
          Editar Perfil
        </Button>
      </CardFooter>
    </Card>
  );
}
