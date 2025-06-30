import { AuthService } from '@/services/auth.service'

// Mock de fetch
global.fetch = jest.fn()

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('login', () => {
    it('debería hacer login exitoso', async () => {
      const mockResponse = {
        status: 201,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      })

      const result = await AuthService.login({ email: 'test@example.com', password: 'password123'})

      expect(fetch).toHaveBeenCalledWith('http://localhost:4001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      expect(result).toEqual(mockResponse)
    })

    it('debería manejar error de login', async () => {
        const mockError = {
          status: 401,
          message: 'Credenciales inválidas'
        };
      
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => mockError
        });
      
        await expect(AuthService.login({email: 'test@example.com', password: 'wrongpassword'}))
          .rejects.toThrow('Credenciales inválidas');
    });

    it('debería manejar errores de red', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(AuthService.login({email: 'test@example.com', password: 'password123'}))
        .rejects.toThrow('Network error')
    })
  })

  describe('loginWithGoogle', () => {
    it('debería hacer login con Google exitoso', async () => {
      const googleData = {
        email: 'test@gmail.com',
        google_uid: 'google123',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }

      const mockResponse = {
        status: 201,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@gmail.com',
          role: 'user'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      })

      const result = await AuthService.loginWithGoogle(googleData)

      expect(fetch).toHaveBeenCalledWith('http://localhost:4001/api/v1/auth/login/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData)
      })

      expect(result).toEqual(mockResponse)
    })

    it('debería manejar error de login con Google', async () => {
      const googleData = {
        email: 'nonexistent@gmail.com',
        google_uid: 'nonexistent123',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }

      const mockError = {
        status: 404,
        message: 'Usuario no encontrado. Por favor regístrate primero.'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockError
      })

      await expect(AuthService.loginWithGoogle(googleData))
        .rejects.toThrow('Usuario no encontrado. Por favor regístrate primero.');
    })
  })

  describe('register', () => {
    it('debería registrar usuario exitosamente', async () => {
      const registerData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'user'
      }

      const mockResponse = {
        status: 201,
        message: 'Usuario registrado exitosamente',
        user: {
          id: '1',
          name: 'New User',
          email: 'newuser@example.com',
          role: 'user'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      })

      const result = await AuthService.register(registerData)

      expect(fetch).toHaveBeenCalledWith('http://localhost:4001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      })

      expect(result).toEqual(mockResponse)
    })

    it('debería manejar error de registro con email duplicado', async () => {
      const registerData = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'user'
      }

      const mockError = {
        status: 400,
        message: 'El email ya está registrado'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError
      })

      await expect(AuthService.register(registerData))
        .rejects.toThrow('El email ya está registrado');
    })
  })

  describe('registerWithGoogle', () => {
    it('debería registrar usuario con Google exitosamente', async () => {
      const googleData = {
        name: 'Google User',
        email: 'googleuser@gmail.com',
        phone: '1234567890',
        role: 'user',
        google_uid: 'google123',
        photo_url: 'https://example.com/photo.jpg'
      }

      const mockResponse = {
        status: 201,
        message: 'Usuario registrado exitosamente con Google',
        user: {
          id: '1',
          name: 'Google User',
          email: 'googleuser@gmail.com',
          role: 'user'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      })

      const result = await AuthService.registerWithGoogle(googleData)

      expect(fetch).toHaveBeenCalledWith('http://localhost:4001/api/v1/auth/register/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData)
      })

      expect(result).toEqual(mockResponse)
    })
  })
}) 