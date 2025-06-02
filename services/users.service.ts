import { API_URL } from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from "./http.service";

/**
 * Interfaz usuarios
 */

export interface IUsersResponse<t> {
  status: number;
  message: string;
  data: t[];
  count: number;
}

export interface UserRequestModel {
  id: string;
  name: string;
  email: string;
  identification: string;
  phone: string;
  user_type: string | undefined;
}

export interface CreateUserDto extends UserRequestModel{
  account_id: number;
}
export interface EditUserDto extends CreateUserDto {}

export interface DefaultUsersResponse { 
  message: string
}

/**
 * Servicio para manejar las operaciones relacionadas con usuarios
 */
export const UsersService = {
  /**
   * Crear usuario
   */
  async createUser(data: UserRequestModel, account_id: number): Promise<DefaultUsersResponse> {
    try {
        data.id = uuidv4();
        const data_updated = data as unknown as CreateUserDto;
        // añadir account dinamico
        data_updated.account_id = account_id;
        const response = await HttpService.post<DefaultUsersResponse>(`/users/create`, data_updated);

        return response;
    } catch (error: any) {
        throw new Error(error.message || "Error al crear usuario");
    }
  },
  // obtener todos los usuarios
  async getUsers(account_id: number): Promise<IUsersResponse<UserRequestModel>> {
    try {
      const response = await HttpService.get<IUsersResponse<UserRequestModel>>(`/users/all?account_id=${account_id}`);
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al obtener usuarios");
    }
  },
  // actualizar usuario
  async updateUser(data: Partial<UserRequestModel>, account_id: number): Promise<DefaultUsersResponse> {
    try {
      const data_updated = data as unknown as EditUserDto;
      // añadir account dinamico
      data_updated.account_id = account_id;
      const response = await HttpService.put<DefaultUsersResponse>(`/users/update`, data_updated );

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al actualizar usuario");
    }
  },
  // borrar usuario 

  async deleteUser(userId: string, account_id: number): Promise<DefaultUsersResponse> {
    try {
      const response = await HttpService.delete<DefaultUsersResponse>(`/users/delete/${userId}?account_id=${account_id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al eliminar usuario");
    }
  },

  
  

  /**
   * Obtener una lista de usuarios (solo para administradores)
   */
  
};
