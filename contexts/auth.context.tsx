"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "@/components/navigation";
import { AuthService, AuthResponse, User } from "@/services/auth.service";
import { APP_ROUTES } from "@/lib/constants";
import { UserRequestModel, DefaultUsersResponse, UsersService } from "@/services/users.service";
import { AccountRequestModel } from "@/services/accounts.service";

// Tipo para datos de usuario de Google
type GoogleUserData = {
  email: string;
  name: string;
  photoURL: string;
  uid: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: (userData: GoogleUserData) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, phone: string, role: string) => Promise<AuthResponse>;
  registerWithGoogle: (userData: GoogleUserData) => Promise<AuthResponse>;
  logout: () => void;
  account: AccountRequestModel;
  setAccount: (account: AccountRequestModel) => void; 
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountRequestModel>(
    {
      id: 0,
      name: "",
      domain: "",
      parent_account_id: 0,
      company_id: ""
    }
  );
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar datos de autenticación del localStorage al iniciar
  useEffect(() => {
    const initAuth = () => {
      try {
        // Verificar si hay un token guardado
        const savedToken = AuthService.getToken();
        const savedUser = AuthService.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch (error) {
        console.error("Error al inicializar la autenticación:", error);
        // Si hay un error, limpiar los datos de autenticación
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const response = await AuthService.login({ email, password });
      
      // Guardar datos de autenticación
      setToken(response.token);
      setUser(response.user);
      AuthService.saveAuth(response);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión con Google
  const loginWithGoogle = async (userData: GoogleUserData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      
      // Crear un usuario temporal con los datos de Google
      const googleUser: User = {
        id: "0",
        name: userData.name,
        email: userData.email,
        phone: "",
        role: "user",
        photo_url: userData.photoURL,
        google_uid: userData.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Intentar hacer login con el backend usando el email de Google
      // Si el usuario no existe, se puede crear automáticamente
      const response = await AuthService.loginWithGoogle({ 
        email: userData.email, 
        google_uid: userData.uid,
        name: userData.name,
        photo_url: userData.photoURL
      });
      
      // Guardar datos de autenticación
      setToken(response.token);
      setUser(response.user);
      AuthService.saveAuth(response);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    role: string
  ): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const response = await AuthService.register({ name, email, password, phone, role });
      
      // Guardar datos de autenticación
      // setToken(response.token);
      // setUser(response.user);
      // AuthService.saveAuth(response);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo usuario con Google
  const registerWithGoogle = async (userData: GoogleUserData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      
      const response = await AuthService.registerWithGoogle({
        name: userData.name,
        email: userData.email,
        phone: "",
        role: "user",
        google_uid: userData.uid,
        photo_url: userData.photoURL
      });
      
      // Guardar datos de autenticación
      setToken(response.token);
      setUser(response.user);
      AuthService.saveAuth(response);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    AuthService.logout();
    setToken(null);
    setUser(null);
    router.push(APP_ROUTES.HOME);
  };

  const setAccountContext = (account: AccountRequestModel) => {
    setSelectedAccount(account);
  };

  
  // Valor del contexto
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    loginWithGoogle,
    register,
    registerWithGoogle,
    logout,
    account: selectedAccount,
    setAccount: setAccountContext,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
