import { HttpService } from "./http.service";

/**
 * Interfaz para el perfil de usuario
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Servicio para manejar las operaciones relacionadas con usuarios
 */
export const UserService = {
  /**
   * Obtener el perfil del usuario actual
   */
  async getProfile(): Promise<UserProfile> {
    try {
      return await HttpService.get<UserProfile>("/users/profile");
    } catch (error: any) {
      throw new Error(error.message || "Error al obtener el perfil del usuario");
    }
  },

  /**
   * Actualizar el perfil del usuario actual
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      return await HttpService.put<UserProfile>("/users/profile", data);
    } catch (error: any) {
      throw new Error(error.message || "Error al actualizar el perfil del usuario");
    }
  },

  /**
   * Cambiar la contraseña del usuario actual
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await HttpService.post<{ message: string }>("/users/change-password", {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      throw new Error(error.message || "Error al cambiar la contraseña");
    }
  },

  /**
   * Obtener una lista de usuarios (solo para administradores)
   */
  async getUsers(): Promise<UserProfile[]> {
    try {
      return await HttpService.get<UserProfile[]>("/users");
    } catch (error: any) {
      throw new Error(error.message || "Error al obtener la lista de usuarios");
    }
  },
};
