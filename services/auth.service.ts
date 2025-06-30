import { API_URL } from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid';

// Tipos para la autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GoogleLoginCredentials {
  email: string;
  google_uid: string;
  name: string;
  photo_url: string;
}

export interface RegisterData {
  id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

export interface GoogleRegisterData {
  name: string;
  email: string;
  phone: string;
  role: string;
  google_uid: string;
  photo_url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  image?: string;
  photo_url?: string;
  google_uid?: string;
  created_at?: string;
  updated_at?: string;
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
 * Servicio para manejar la autenticación con el backend
 */
export const AuthService = {
  /**
   * Iniciar sesión con email y password
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
        throw new Error(errorData.message || "Error al iniciar sesión");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión");
    }
  },

  /**
   * Iniciar sesión con Google
   */
  async loginWithGoogle(credentials: GoogleLoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || "Error al iniciar sesión con Google");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión con Google");
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
   * Registrar un nuevo usuario con Google
   */
  async registerWithGoogle(data: GoogleRegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || "Error al registrar usuario con Google");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error al registrar usuario con Google");
    }
  },

  /**
   * Cerrar sesión (eliminar token del almacenamiento local)
   */
  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  },

  /**
   * Obtener el token de autenticación
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
   * Guardar los datos de autenticación en el almacenamiento local
   */
  saveAuth(data: AuthResponse): void {
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
  },

  /**
   * Crear respuesta de autenticación local para Google (fallback)
   */
  createLocalAuthResponse(credentials: GoogleLoginCredentials): AuthResponse {
    const user: User = {
      id: credentials.google_uid,
      name: credentials.name,
      email: credentials.email,
      role: "user",
      phone: "",
      photo_url: credentials.photo_url,
      google_uid: credentials.google_uid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Generar un token temporal (en producción, esto debería ser manejado por el backend)
    const token = btoa(JSON.stringify({
      user: user,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    }));

    return {
      token,
      user
    };
  },
};
