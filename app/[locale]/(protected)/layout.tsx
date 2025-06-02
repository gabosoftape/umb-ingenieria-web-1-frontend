import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import BrandSidebar from '@/components/partials/sidebar'
import BrandFooter from '@/components/partials/footer'
import ThemeCustomize from '@/components/partials/customizer'
import BrandHeader from '@/components/partials/header'
import AuthProtectedRoute from "@/components/auth/auth-protected-route";
import { headers } from "next/headers";
import { brandConfig } from "@/lib/brand";

const layout = async ({ children }: { children: React.ReactNode }) => {
    // Obtenemos el locale de los headers
    const headersList = await headers();
    const locale = headersList.get('X-NEXT-INTL-LOCALE') || brandConfig.defaultLocale;
    
    return (
        <AuthProtectedRoute locale={locale}>
            <LayoutProvider>
                <ThemeCustomize />
                <BrandHeader />
                <BrandSidebar />
                <LayoutContentProvider>
                    {children}
                    {/* <BrandFooter /> */}
                </LayoutContentProvider>
            </LayoutProvider>
        </AuthProtectedRoute>
    );
};

export default layout;
