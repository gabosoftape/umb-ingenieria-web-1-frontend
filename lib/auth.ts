import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, type User } from "./data";
import { API_URL } from "./constants";

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Si el usuario acaba de iniciar sesión, añade el token de API al token JWT
      if (user) {
        // Si hay un token de API en el objeto user, lo añadimos al token JWT
        if ('apiToken' in user) {
          token.apiToken = user.apiToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Añadir el token de API a la sesión para que esté disponible en el cliente
      if (token.apiToken) {
        session.apiToken = token.apiToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  providers: [
    Google,
    GitHub,
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (credentials === null) return null;
        
        try {
          // Usar la API personalizada para autenticar
          const response = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
          }

          // Si la autenticación es exitosa, devolver el usuario con el token de API
          if (data.token) {
            // Obtener los datos del usuario de tu API o usar getUserByEmail
            const user = getUserByEmail(credentials.email as string);
            
            if (user) {
              // Añadir el token de API al objeto user
              return {
                ...user,
                apiToken: data.token,
              };
            }
          }
          
          throw new Error('Usuario no encontrado');
        } catch (error) {
          throw new Error(error as string);
        }
      },
    }),
  ],
});

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
}) {
  const response = await fetch(API_URL +'/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al registrar usuario');
  }

  return response.json();
}
