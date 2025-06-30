/**
 * Configuración centralizada de la marca blanca
 * Este archivo contiene todas las configuraciones relacionadas con la marca
 * que se utilizan en toda la aplicación.
 */

export const brandConfig = {
  // Información básica
  name: "UMB - INGENIERIA WEB",
  shortName: "UMB - INGENIERIA WEB",
  
  // URLs
  url: "https://arpadine.com",
  
  // Contacto
  email: "admin@bespoke-dashboard.com",
  supportEmail: "support@bespoke-dashboard.com",
  password: "password", // Contraseña por defecto para ejemplos
  
  // Rutas
  mainRoute: "/dashboard/analytics",
  analyticsRoute: "/dashboard/analytics",
  
  // Textos
  welcomeText: "Welcome to UmbDashboard",
  signInTitle: "Sign in",
  signInText: "Sign in to your account to start using UMB-DASHBOARD-APP",
  signInButtonText: "Sign In",
  signUpTitle: "Sign up",
  signUpText: "Create an account to start using UMB-DASHBOARD-APP",
  signUpButtonText: "Sign Up",
  resetPasswordText: "Reset Password with UMB-DASHBOARD-APP",
  resetPasswordButtonText: "Send Recovery Email",
  copyrightText: (year: number) => `Copyright ${year}, DUMAR ARTURO PABON E. All Rights Reserved.`,
  
  // Clases CSS
  cssPrefix: "bespoke-dashboard",
  appClass: "bespoke-dashboard-app",
  
  // Metadatos
  metaTitle: "UMBDashboard - Actividad Seguridad",
  metaDescription: "BespokeDashboard is a modern admin dashboard template",
  
  // Configuración de localización
  localeHeader: "bespoke-locale",
  defaultLocale: "es",
  locales: ["en", "es", "ar"],
  
  // Textos para preguntas frecuentes
  faqTexts: {
    howItWorks: "How does UMB-DASHBOARD-APP work?",
    whereToLearn: "Where I can learn more about using UMB-DASHBOARD-APP?",
    whyImportant: "Why BespokeDashboard is so important?",
    whereToFind: "Where I can find BespokeDashboard?",
  },
  
  // Redes sociales
  socialLinks: {
    twitter: "https://twitter.com/gabriel_pabon_e",
    facebook: "https://facebook.com/gabriel.pabon.7543",
    instagram: "https://instagram.com/bespoke-dashboard",
    linkedin: "https://linkedin.com/company/bespoke-dashboard",
  }
};

export default brandConfig;
