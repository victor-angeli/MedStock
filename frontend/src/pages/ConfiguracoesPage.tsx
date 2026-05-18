import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ConfiguracoesPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-8">
      <div className="w-full flex justify-end">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-base font-semibold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
