"use client";

import { Link } from '@/i18n/routing';
import { RegisterForm } from "@/components/partials/auth/register-form";
import Image from "next/image";
import Copyright from "@/components/partials/auth/copyright";
import Logo from "@/components/partials/auth/logo";
import Social from "@/components/partials/auth/social";
import { brandConfig } from '@/lib/brand';
import { useUnauthenticatedCheck } from '@/hooks/use-auth-check';
import { use } from 'react';

const Register = ({ params }: { params: Promise<{ locale: string }> }) => {
  // Verificar si el usuario ya está autenticado y redirigirlo al dashboard si lo está
  const { locale } = use(params); 
  const { loading } = useUnauthenticatedCheck(locale);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
        <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
          <div
            className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 
 relative z-[1] bg-default-50"
          >
            <div className="max-w-[520px] pt-20 ps-20">
              <Link href={brandConfig.mainRoute} className="mb-6 inline-block">
                <Logo />
              </Link>

              <h4>
                Unlock your Project
                <span className="text-default-800  font-bold ms-2">
                  performance
                </span>
              </h4>
            </div>
            <div className="absolute left-0 bottom-[-130px] h-full w-full z-[-1]">
              <Image
                src="/images/auth/ils1.svg"
                alt=""
                width={300}
                height={300}
                className="mb-10 w-full h-full"
              />
            </div>
          </div>
          <div className="flex-1 relative dark:bg-default-100 bg-white ">
            <div className=" h-full flex flex-col">
              <div className="max-w-[524px] md:px-[42px] md:py-[44px] p-7  mx-auto w-full text-2xl text-default-900  mb-3 h-full flex flex-col justify-center">
                <div className="flex justify-center items-center text-center mb-6 lg:hidden ">
                  <Link href={brandConfig.mainRoute}>
                    <Logo />
                  </Link>
                </div>
                <div className="text-center 2xl:mb-10 mb-5">
                  <h4 className="font-medium">Registro</h4>
                  <div className="text-default-500  text-base">
                    Crea una cuenta para comenzar a usar {brandConfig.name}
                  </div>
                </div>
                <RegisterForm locale={locale} />
                <div className=" relative border-b-[#9AA2AF] border-opacity-[16%] border-b pt-6">
                  <div className=" absolute inline-block  bg-default-50 dark:bg-default-100 left-1/2 top-1/2 transform -translate-x-1/2 px-4 min-w-max text-sm  text-default-500  font-normal ">
                    O continuar con
                  </div>
                </div>
                <div className="max-w-[242px] mx-auto mt-8 w-full">
                  <Social locale={locale} mode="register" />
                </div>
                <div className="max-w-[225px] mx-auto font-normal text-default-500  2xl:mt-12 mt-6 uppercase text-sm">
                  ¿Ya tienes cuenta?
                  <Link
                    href={`/`}
                    className="text-default-900  font-medium hover:underline ml-2"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </div>
              <div className="text-xs font-normal text-default-500 z-[999] pb-10 text-center">
                <Copyright />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
