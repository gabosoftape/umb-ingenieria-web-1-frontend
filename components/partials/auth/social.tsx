"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/auth.context";
import { useRouter } from "@/components/navigation";

const Social = ({ locale }: { locale: string }) => {
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    // En una implementación real, aquí se manejaría la autenticación con Google
    // Por ahora, mostramos un mensaje indicando que esta funcionalidad no está disponible
    alert("La autenticación con Google no está disponible en esta versión.");
  };

  return (
    <>
      <ul className="flex">
        <li className="flex-1">
          <a
            href="#"
            className="inline-flex h-10 w-10 p-2 bg-[#1C9CEB] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={300} height={300} className="w-full h-full" src="/images/icon/tw.svg" alt="Twitter" />
          </a>
        </li>
        <li className="flex-1">
          <a
            href="#"
            className="inline-flex h-10 w-10 p-2 bg-[#395599] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={300} height={300} className="w-full h-full" src="/images/icon/fb.svg" alt="Facebook" />
          </a>
        </li>
        <li className="flex-1">
          <a
            href="#"
            className="inline-flex h-10 w-10 p-2 bg-[#0A63BC] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={300} height={300} className="w-full h-full" src="/images/icon/in.svg" alt="LinkedIn" />
          </a>
        </li>
        <li className="flex-1">
          <button 
            onClick={handleGoogleLogin} 
            className="inline-flex h-10 w-10 p-2 bg-[#EA4335] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={300} height={300} className="w-full h-full" src="/images/icon/gp.svg" alt="Google" />
          </button>
        </li>
      </ul>
    </>
  );
};

export default Social;
