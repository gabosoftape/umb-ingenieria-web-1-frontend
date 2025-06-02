import { AuthService, LoginCredentials, RegisterData } from "@/services/auth.service";

// Esta función utiliza nuestro servicio de autenticación personalizado
export const loginUser = async (data: LoginCredentials) => {
  try {
    const result = await AuthService.login(data);
    // Guardar los datos de autenticación
    AuthService.saveAuth(result);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { error: error.message || "Error desconocido al iniciar sesión" };
  }
}

export const registerUser = async (data: RegisterData) => {
  try {
    // Usar nuestro servicio de autenticación personalizado
    const result = await AuthService.register(data);
    
    // Si el registro es exitoso, guardar los datos de autenticación
    AuthService.saveAuth(result);
    
    return { success: true, user: result.user };
  } catch (error: any) {
    return { error: error.message || "Error al registrar usuario" };
  }
}

// Nueva función para cerrar sesión
export const logoutUser = async () => {
  try {
    AuthService.logout();
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Error al cerrar sesión");
  }
}