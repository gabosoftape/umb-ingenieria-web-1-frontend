"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon"
import Image from "next/image";
import { Link } from '@/i18n/routing';
import LogoutButton from "@/components/auth/logout-button";
import { useAuth } from "@/contexts/auth.context";

const ProfileInfo = () => {
  const { user } = useAuth();
  const userInitial = user?.name?.charAt(0) || "U";
  const defaultAvatar = `/images/avatar/default-avatar.png`;

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className=" cursor-pointer">
          <div className=" flex items-center gap-3  text-default-800 ">
            {user?.image ? (
              <Image
                src={user.image}
                alt={userInitial}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                {userInitial}
              </div>
            )}

            <div className="text-sm font-medium  capitalize lg:block hidden  ">
              {user?.name || "Usuario"}
            </div>
            <span className="text-base  me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
            {user?.image ? (
              <Image
                src={user.image}
                alt={userInitial}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                {userInitial}
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-default-800 capitalize ">
                {user?.name || "Usuario"}
              </div>
              <Link
                href="/dashboard"
                className="text-xs text-default-600 hover:text-primary"
              >
                {user?.email || "usuario@ejemplo.com"}
              </Link>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {[
              {
                name: "Perfil",
                icon: "heroicons:user",
                href: "/user-profile"
              },
              {
                name: "Configuración",
                icon: "heroicons:cog-6-tooth",
                href: "/settings"
              },
            ].map((item, index) => (
              <Link
                href={item.href}
                key={`info-menu-${index}`}
                className="cursor-pointer"
              >
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 cursor-pointer">
                  <Icon icon={item.icon} className="w-4 h-4" />
                  {item.name}
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer">
            <div className="w-full">
              <LogoutButton className="w-full flex items-center gap-2 justify-start p-0 hover:bg-transparent" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileInfo;
