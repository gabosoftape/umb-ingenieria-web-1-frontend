import { API_URL } from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from "./http.service";
/**
 * Interfaz usuarios
 */

export interface IAccountsResponse<t> {
  status: number;
  message: string;
  data: t[];
  count: number;
}


export interface AccountUserRelResponseModel {
  user_id: string;
  account_id: number;
  account?: AccountRequestModel
}

export interface AccountRequestModel {
  id?: number
  name: string;
  domain: string;
  parent_account_id?: number;
  company_id: string;
}
export interface AccountResponseModel {
  id: number
  name: string;
  domain: string;
  parent_account_id?: number;
  company_id: string;
}

export interface CreateAccountDto extends AccountRequestModel{
  account_id: number;
}
export interface EditAccountDto extends CreateAccountDto {}

export interface DefaultAccountsResponse { 
  message: string
}

export interface AssociateUserToAccountsRequestModel {
  user_id: string;
  accounts: number[];
}

/**
 * Servicio para manejar las operaciones relacionadas con cuentas
 */
export const AccountsService = {
  /**
   * Crear Cuenta
   */
  async createAccount(data: CreateAccountDto): Promise<DefaultAccountsResponse> {
    try {
      const data_updated = data as unknown as CreateAccountDto;
      // añadir account dinamico
      data_updated.account_id = 1;
      const response = await HttpService.post<DefaultAccountsResponse>(`/accounts/create`, data_updated);

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al crear usuario");
    }
  },
  // obtener todos los usuarios
  async getAccounts(account_id: number): Promise<IAccountsResponse<AccountResponseModel>> {
    try {
      const response = await HttpService.get<IAccountsResponse<AccountResponseModel>>(`/accounts/all?account_id=${account_id}`);

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al obtener cuentas");
    }
  },
  // actualizar cuentas
  async updateAccount(data: Partial<AccountRequestModel>): Promise<DefaultAccountsResponse> {
    try {
      const data_updated = data as unknown as EditAccountDto;
      // añadir account dinamico
      data_updated.account_id = 1;
      const response = await HttpService.put<DefaultAccountsResponse>(`/accounts/update`, data_updated );

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al actualizar cuenta");
    }
  },
  // borrar cuenta 

  async deleteAccount(accountId: number): Promise<DefaultAccountsResponse> {
    try {
      const response = await HttpService.delete<DefaultAccountsResponse>(`/accounts/delete/${accountId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al eliminar cuenta");
    }
  },

   // obtener propia cuenta
   async getSelfAccount(): Promise<IAccountsResponse<AccountRequestModel>> {
    try {
      const response = await HttpService.get<IAccountsResponse<AccountRequestModel>>(`/accounts/self`);

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al obtener cuenta");
    }
  },

  // obtener propia cuenta
  async getUserAccounts(user_id: string): Promise<IAccountsResponse<AccountRequestModel>> {
    try {
      const response = await HttpService.get<IAccountsResponse<AccountRequestModel>>(`/accounts/user/${user_id}`);

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al obtener cuentas del usuario con id "+ user_id)
    }
  },
  

  /**
   * Asociar Cuentas a usuarios
   */
  async updateUserAccounts(user_id: string, accounts: number[]): Promise<DefaultAccountsResponse> {
    try {
      const data_updated: AssociateUserToAccountsRequestModel = {
        user_id: user_id,
        accounts: accounts
      };
      
      const response = await HttpService.post<DefaultAccountsResponse>(`/accounts/associate`, data_updated);

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al crear usuario");
    }
  },
  
};
