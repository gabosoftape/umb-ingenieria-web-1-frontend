"use client";

import React, {useState} from 'react'
import { Ellipsis, LogOut } from "lucide-react";
import { usePathname } from "@/components/navigation";
import { cn } from "@/lib/utils";
import {getMenuList, Group} from "@/lib/menus";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { useConfig } from "@/hooks/use-config";
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";
import MenuWidget from "../common/menu-widget";
import SearchBar from '@/components/partials/sidebar/common/search-bar'
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation'
import { getLangDir } from 'rtl-detect';
import Logo from '@/components/logo';
import SidebarHoverToggle from '@/components/partials/sidebar/sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';
import { useMediaQuery } from '@/hooks/use-media-query';
import AccountSwitcher from '../common/account-switcher';
import LogoutButton from "@/components/auth/logout-button";
import {useAuth} from "@/contexts/auth.context";


export function MenuClassic({ }) {
    // translate
    const t = useTranslations("Menu")
    const pathname = usePathname();
    const params = useParams<{ locale: string; }>();
    const direction = getLangDir(params?.locale ?? '');

    const isDesktop = useMediaQuery('(min-width: 1280px)')


    const menuList = getMenuList(pathname, t);
    const [generalMenuList, setGeneralMenuList] = useState<Group[]>(menuList);
    const [config, setConfig] = useConfig()
    const collapsed = config.collapsed
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig;
    const { user } = useAuth();
    const scrollableNodeRef = React.useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = React.useState(false);

    React.useEffect(() => {
        if(user && user.role != 'sa'){
            menuList[2].menus = menuList[2].menus.filter((m) => m.id != 'master_accounts');
            setGeneralMenuList(menuList);
        }
    }, [user]);

    return (
        <>
            {isDesktop && (
                <div className="flex items-center justify-between  px-4 py-4">
                    <Logo />
                    <SidebarHoverToggle />
                </div>
            )}




            <ScrollArea className="[&>div>div[style]]:!block" dir={direction}>
                {isDesktop && (
                    <div className={cn(' space-y-3 mt-6 ', {
                        'px-4': !collapsed || hovered,
                        'text-center': collapsed || !hovered
                    })}>

                        <AccountSwitcher />
                        <SearchBar />
                    </div>

                )}

                <nav className="mt-8 h-full w-full">
                    <ul className=" h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
                        {generalMenuList?.map(({ groupLabel, menus }, index) => (
                            <li className={cn("w-full", groupLabel ? "" : "")} key={index}>
                                {(!collapsed || hovered) && groupLabel || !collapsed === undefined ? (
                                    <MenuLabel label={groupLabel} />
                                ) : collapsed && !hovered && !collapsed !== undefined && groupLabel ? (
                                    <TooltipProvider>
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger className="w-full">
                                                <div className="w-full flex justify-center items-center">
                                                    <Ellipsis className="h-5 w-5 text-default-700" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{groupLabel}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    null
                                )}

                                {menus.map(
                                    ({ href, label, icon, active, id, submenus }, index) =>
                                        submenus.length === 0 ? (
                                            <div className="w-full mb-2 last:mb-0" key={index}>
                                                <TooltipProvider disableHoverableContent>
                                                    <Tooltip delayDuration={100}>
                                                        <TooltipTrigger asChild>

                                                            <div>

                                                                <MenuItem label={label} icon={icon} href={href} active={active} id={id} collapsed={collapsed} />
                                                            </div>
                                                        </TooltipTrigger>
                                                        {collapsed && (
                                                            <TooltipContent side="right">
                                                                {label}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ) : (
                                            <div className="w-full mb-2" key={index}>
                                                <CollapseMenuButton
                                                    icon={icon}
                                                    label={label}
                                                    active={active}
                                                    submenus={submenus}
                                                    collapsed={collapsed}
                                                    id={id}

                                                />
                                            </div>
                                        )
                                )}

                            </li>
                        ))}
                        <li className="absolute bottom-4">
                            <div className="w-full">
                                <LogoutButton
                                    className="w-full flex items-center gap-2 justify-start p-0 hover:bg-transparent"/>
                            </div>
                        </li>
                    </ul>
                </nav>

            </ScrollArea>
        </>
    );
}
