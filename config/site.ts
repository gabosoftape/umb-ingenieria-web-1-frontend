import { brandConfig } from "@/lib/brand";

export const siteConfig = {
  name: brandConfig.name,
  shortName: brandConfig.shortName,
  url: brandConfig.url,
  ogImage: "/images/og-image.jpg",
  description: brandConfig.metaDescription,
  links: {
    twitter: brandConfig.socialLinks.twitter,
    facebook: brandConfig.socialLinks.facebook,
    instagram: brandConfig.socialLinks.instagram,
    linkedin: brandConfig.socialLinks.linkedin,
  },
  contact: {
    email: brandConfig.email,
    supportEmail: brandConfig.supportEmail,
  },
  localization: {
    defaultLocale: brandConfig.defaultLocale,
    locales: brandConfig.locales,
  }
}

export type SiteConfig = typeof siteConfig