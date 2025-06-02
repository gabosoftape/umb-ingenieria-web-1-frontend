"use client";

import { useAuth } from "@/contexts/auth.context";
import { HttpService } from "@/services/http.service";
import { useState } from "react";
import { API_URL } from "@/lib/constants";

/**
 * Hook personalizado para realizar peticiones a la API con autenticaciu00f3n
 * Utiliza el token de autenticaciu00f3n del contexto para autenticar las peticiones
 */
export function useApi() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Realiza una peticiu00f3n a la API con el token de autenticaciu00f3n
   */
  const fetchApi = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!isAuthenticated) {
      throw new Error("Usuario no autenticado");
    }

    setLoading(true);
    setError(null);

    try {
      // Construir la URL completa
      const url = `${API_URL}${endpoint}`;
      
      // Configurar los headers con el token de autenticaciu00f3n
      const headers = new Headers(options.headers || {});
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      // Realizar la peticiu00f3n
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Manejar errores de la respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      // Devolver los datos de la respuesta
      return await response.json();
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realiza una peticiu00f3n GET a la API
   */
  const get = <T>(endpoint: string): Promise<T> => {
    return HttpService.get<T>(endpoint);
  };

  /**
   * Realiza una peticiu00f3n POST a la API
   */
  const post = <T>(endpoint: string, data: any): Promise<T> => {
    return HttpService.post<T>(endpoint, data);
  };

  /**
   * Realiza una peticiu00f3n PUT a la API
   */
  const put = <T>(endpoint: string, data: any): Promise<T> => {
    return HttpService.put<T>(endpoint, data);
  };

  /**
   * Realiza una peticiu00f3n DELETE a la API
   */
  const del = <T>(endpoint: string): Promise<T> => {
    return HttpService.delete<T>(endpoint);
  };

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
}
