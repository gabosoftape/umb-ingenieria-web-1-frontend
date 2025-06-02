import { AuthService } from "./auth.service";
import { API_URL } from "@/lib/constants";

export interface DefaultResponse {
  message: string;
}

export interface Paginated<T> {
    data: T[];
    total: number;
}
/**
 * Servicio para realizar peticiones HTTP autenticadas al backend
 */
export const HttpService = {
  /**
   * Realizar una peticiu00f3n GET autenticada
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      const token = AuthService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        // Si el token es invu00e1lido (401), intentar cerrar sesiu00f3n
        if (response.status === 401) {
          AuthService.logout();
          window.location.href = "/auth/login";
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error en la peticiu00f3n");
    }
  },

  /**
   * Realizar una peticiu00f3n POST autenticada
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const token = AuthService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Si el token es invu00e1lido (401), intentar cerrar sesiu00f3n
        if (response.status === 401) {
          AuthService.logout();
          window.location.href = "/auth/login";
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error en la peticiu00f3n");
    }
  },

  /**
   * Realizar una peticiu00f3n PUT autenticada
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const token = AuthService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Si el token es invu00e1lido (401), intentar cerrar sesiu00f3n
        if (response.status === 401) {
          AuthService.logout();
          window.location.href = "/auth/login";
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error en la peticiu00f3n");
    }
  },

  /**
   * Realizar una peticiu00f3n DELETE autenticada
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const token = AuthService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        // Si el token es invu00e1lido (401), intentar cerrar sesiu00f3n
        if (response.status === 401) {
          AuthService.logout();
          window.location.href = "/auth/login";
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Error en la peticiu00f3n");
    }
  },
};
