import { brandConfig } from '@/lib/brand';

const Copyright = () => {
    const currentYear = new Date().getFullYear();
  return <>{brandConfig.copyrightText(currentYear)}</>;
};

export default Copyright;
