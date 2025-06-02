import { DefaultResponse, HttpService, Paginated } from "./http.service";
import {v4 as uuidv4} from "uuid";

/**
 * Interfaz para la respuesta de un blog
 */
export interface IBlogResponse<t> {
  status: number;
  message: string;
  data: t | null;
}

/**
 * Interfaz para la respuesta de varios blogs con conteo
 */
export interface IBlogsResponse<t> {
  status: number;
  message: string;
  data: t | null;
  count: number;
}

/**
 * Modelo para la solicitud de un blog
 */
export interface BlogRequestModel {

  id: string;
  name: string;
  description: string;
  text: string;
  account_id: number;
}

/**
 * Modelo para la respuesta de un blog
 */
export interface BlogResponseModel {
  id: string;
  name: string;
  description: string;
  text: string;
  account_id: number;
}

/**
 * Modelo para la creación de un blog
 */
export interface CreateBlogDto {
  id: string;
  name: string;
  description: string;
  text: string;
  account_id: number;
}

/**
 * Modelo para la edición de un blog
 */
export interface EditBlogDto extends CreateBlogDto {}

/**
 * Modelo para un blog general
 */
export interface GeneralBlogDto extends CreateBlogDto {
  account_name: string
}

/**
 * Modelo para la respuesta de la creación de un blog
 */
export interface CreateBlogResponseDto extends CreateBlogDto{}

/**
 * Modelo para la respuesta de la edición de un blog
 */
export interface EditBlogResponseDto extends CreateBlogDto{}

/**
 * Modelo para la respuesta de los blogs por defecto
 */
export interface DefaultBlogsResponse {
  message: string;
}


/**
 * Servicio para la gestión de blogs
 */
export const BlogsService = {
  // Obtener todos los blogs, permitiendo elegir la fuente
  async getBlogs(account_id: number): Promise<BlogResponseModel[]> {
    try {
      const response = await HttpService.get<Paginated<BlogResponseModel> | DefaultResponse>(`/blogs/all?account_id=${account_id}`);
      console.log("Blogs response", response);
      if ('data' in response) {
        return response.data;
      }
      return []; // Si es DefaultResponse, lo devolvemos vacio
    } catch (error: any) {
      throw new Error(error.message || "Error al obtener blogs");
    }
  },

  // Crear blog
  async createBlog(data: CreateBlogDto): Promise<CreateBlogResponseDto | DefaultResponse> {
    try {
      data.id = uuidv4();
      const response = await HttpService.post<CreateBlogResponseDto | DefaultResponse>(`/blogs/create`, data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al crear blog");
    }
  },

  // Actualizar blog
  async updateBlog(data: Partial<EditBlogDto>, account_id: number): Promise<EditBlogResponseDto> {
    try {
      const response = await HttpService.put<EditBlogResponseDto>(`/blogs/update?account_id=${account_id}`, data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al actualizar blog");
    }
  },

  // Eliminar blog
  async deleteBlog(id: string): Promise<DefaultBlogsResponse> {
    try {
      const response = await HttpService.delete<DefaultBlogsResponse>(`/blogs/delete/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Error al eliminar blog");
    }
  }
};
