import { brandConfig } from "@/lib/brand";

export const metadata = {
  title: brandConfig.metaTitle,
  description: brandConfig.metaDescription,
};

const layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default layout;
