import { API_URL } from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid';

// Tipos para la autenticaciu00f3n
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  image?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthError {
  message: string;
  error?: any;
}

/**
 * Servicio para manejar la autenticaciu00f3n con el backend
 */
export const AuthService = {
  /**
   * Iniciar sesiu00f3n con email y password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al iniciar sesiu00f3n");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesiu00f3n");
    }
  },

  /**
   * Registrar un nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    console.log("paso por el service auth");
    data.id = uuidv4();
    console.log("saldra esta data: ", data);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar usuario");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error al registrar usuario");
    }
  },

  /**
   * Cerrar sesiu00f3n (eliminar token del almacenamiento local)
   */
  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  /**
   * Verificar si el usuario estu00e1 autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  },

  /**
   * Obtener el token de autenticaciu00f3n
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  /**
   * Obtener los datos del usuario autenticado
   */
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userJson = localStorage.getItem("auth_user");
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Guardar los datos de autenticaciu00f3n en el almacenamiento local
   */
  saveAuth(data: AuthResponse): void {
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
  },
};
