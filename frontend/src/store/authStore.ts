import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'farmaceutico' | 'medico' | 'enfermeiro'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  clinicId: string
  clinicName: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  validateToken: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      validateToken: () => {
        const { token } = get()
        if (!token) return
        try {
          // Tenta decodificar o payload do JWT (formato: header.payload.signature)
          const payload = JSON.parse(atob(token.split('.')[1]))
          // Verifica se o token está expirado
          if (payload.exp * 1000 < Date.now()) {
            set({ user: null, token: null, isAuthenticated: false })
          }
        } catch {
          // Token inválido ou não é um JWT real (ex: 'mock-token') → limpa sessão
          set({ user: null, token: null, isAuthenticated: false })
        }
      },
    }),
    { name: 'medstock-auth' }
  )
)
