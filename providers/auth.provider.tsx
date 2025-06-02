'use client'
import React from 'react'
import { AuthProvider as CustomAuthProvider } from "@/contexts/auth.context"

// Componente principal que proporciona el contexto de autenticación personalizado
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <CustomAuthProvider>
      {children}
    </CustomAuthProvider>
  )
}

export default AuthProvider