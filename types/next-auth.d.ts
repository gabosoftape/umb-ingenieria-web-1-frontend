import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extiende el tipo Session para incluir el token de API
   */
  interface Session {
    apiToken?: string;
    user?: {
      id?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extiende el tipo User para incluir el token de API
   */
  interface User {
    apiToken?: string;
  }

  /**
   * Extiende el tipo JWT para incluir el token de API
   */
  interface JWT {
    apiToken?: string;
  }
}
