"use client";

import { useState } from 'react';
import { registerUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const userData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        phone: formData.get('phone') as string,
      };

      const response = await registerUser(userData);
      
      // Guardar el token en localStorage
      localStorage.setItem('token', response.token);
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al registrar usuario');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500">{error}</div>}
      {/* Tus campos de formulario aquí */}
    </form>
  );
} 