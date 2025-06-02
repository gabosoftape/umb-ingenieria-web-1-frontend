import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import DashCodeLogo from '@/components/dascode-logo';
import { brandConfig } from '@/lib/brand';

const config: DocsThemeConfig = {
  logo: (
    <span className=" inline-flex gap-2.5 items-center">
      <DashCodeLogo className="  text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background" />
      <span className="  text-lg font-bold text-default ">{brandConfig.name}</span>
    </span>
  ),
  project: {
    link: brandConfig.url,
  },
  banner: {
    key: "1.0-release",
    text: (
      <a href={brandConfig.mainRoute} target="_blank">
        🎉 {brandConfig.name}
      </a>
    ),
  },
  footer: {
    text: (
      <span>
        {brandConfig.copyrightText(new Date().getFullYear())}
      </span>
    ),
  },
  themeSwitch: {
    useOptions() {
      return {
        light: 'Light',
        dark: 'Dark',
        system: 'System', 
      };
    },
  },
  useNextSeoProps() {
    return {
      titleTemplate: `%s – ${brandConfig.name}`,
    };
  },
};

export default config