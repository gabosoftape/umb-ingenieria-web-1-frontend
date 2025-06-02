import PageTitle from "@/components/page-title";
import { Metadata } from "next";
import { brandConfig } from "@/lib/brand";

export const metadata: Metadata = {
  title: brandConfig.metaTitle,
  description: brandConfig.metaDescription,
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>
    <PageTitle className="mb-6" />
    {children}</>;
};

export default Layout;
