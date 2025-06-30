"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/auth.context";
import { useRouter } from "@/components/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";
import { brandConfig } from '@/lib/brand';

interface GoogleButtonProps {
  locale: string;
  mode: 'login' | 'register';
}

const GoogleButton = ({ locale, mode }: GoogleButtonProps) => {
  const { loginWithGoogle, registerWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleAuth = async () => {
    // Verificar si Firebase está configurado
    if (!auth || !googleProvider) {
      toast.error("Firebase no está configurado", {
        description: "Por favor, configura las variables de entorno de Firebase"
      });
      return;
    }

    try {
      // Iniciar autenticación con Google usando Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Extraer información del usuario de Google
      const userData = {
        email: user.email || '',
        name: user.displayName || '',
        photoURL: user.photoURL || '',
        uid: user.uid
      };

      let response;
      
      if (mode === 'login') {
        // Intentar login con Google
        response = await loginWithGoogle(userData);
        toast.success("Inicio de sesión con Google exitoso");
      } else {
        // Registrar usuario con Google
        response = await registerWithGoogle(userData);
        toast.success("Registro con Google exitoso");
      }
      
      // Redireccionar al dashboard
      router.push(brandConfig.mainRoute);
    } catch (error: any) {
      console.error(`Error en autenticación con Google (${mode}):`, error);
      
      // Manejar errores específicos de Firebase
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Operación cancelada");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("El popup fue bloqueado. Por favor, permite popups para este sitio.");
      } else if (error.code === 'auth/network-request-failed') {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Demasiados intentos. Inténtalo más tarde.");
      } else if (error.code === 'auth/user-disabled') {
        toast.error("Esta cuenta ha sido deshabilitada.");
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error("La autenticación con Google no está habilitada.");
      } else {
        const action = mode === 'login' ? 'iniciar sesión' : 'registrarse';
        toast.error(`Error al ${action} con Google`, {
          description: error.message || "Inténtalo de nuevo"
        });
      }
    }
  };

  return (
    <button 
      onClick={handleGoogleAuth} 
      className="inline-flex h-12 w-12 p-2 bg-[#EA4335] text-white text-2xl flex-col items-center justify-center rounded-full hover:bg-[#D33426] transition-colors duration-200"
      title={`${mode === 'login' ? 'Iniciar sesión' : 'Registrarse'} con Google`}
    >
      <Image 
        width={24} 
        height={24} 
        className="w-6 h-6" 
        src="/images/icon/gp.svg" 
        alt="Google" 
      />
    </button>
  );
};

export default GoogleButton; 