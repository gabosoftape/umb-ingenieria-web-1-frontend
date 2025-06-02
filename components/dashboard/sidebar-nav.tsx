import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const dashboardItems = [
    { href: "/dashboard", title: "Panel Principal" },
    { href: "/dashboard/call-center", title: "Call Center" },
    { href: "/dashboard/visitor-auth", title: "Autorización Visitantes" },
    { href: "/dashboard/notifications", title: "Notificaciones" },
    { href: "/dashboard/voip-calls", title: "Llamadas VoIP" },
  ];

  const adminItems = [
    { href: "/dashboard/admin/minuta", title: "Minuta Virtual" },
    { href: "/dashboard/admin/parqueaderos", title: "Parqueaderos" },
    { href: "/dashboard/admin/incidentes", title: "Incidentes" },
    { href: "/dashboard/admin/turnos", title: "Turnos" },
    { href: "/dashboard/admin/eventos", title: "Eventos" },
  ];

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      <div className="mb-4">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Panel de Control
        </h2>
        {dashboardItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start"
            )}
          >
            {item.title}
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Administración
        </h2>
        {adminItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start"
            )}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
} 