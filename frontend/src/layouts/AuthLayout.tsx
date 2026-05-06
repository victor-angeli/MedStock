import { Outlet } from 'react-router-dom'
import logoMedstock from '@/assets/logo_medstock.jpg'

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      {/* Painel esquerdo — visual */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay gradiente azul por cima da foto */}
        <div
          className="absolute inset-0 z-0"
          style={{ background: 'linear-gradient(145deg, rgba(13,71,161,0.92) 0%, rgba(26,115,232,0.85) 60%, rgba(66,165,245,0.80) 100%)' }}
        />
        {/* Logo */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
            <img src={logoMedstock} alt="MedStock" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-white font-bold text-xl leading-tight">MedStock</div>
            <div className="text-blue-200 text-sm">Controle de Estoque</div>
          </div>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold leading-snug mb-4 drop-shadow-md">
            Gestão inteligente<br />do estoque da sua<br />clínica
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
            Rastreie entradas e saídas, receba alertas de vencimento e mantenha o controle total dos medicamentos em tempo real.
          </p>

          <div className="flex gap-6 mt-10">
            {[
              { num: '100%', label: 'Rastreabilidade' },
              { num: '0', label: 'Perdas evitáveis' },
              { num: '24h', label: 'Monitoramento' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <div className="text-white text-2xl font-extrabold">{item.num}</div>
                <div className="text-blue-200 text-xs mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-blue-300 text-xs relative z-10">© {new Date().getFullYear()} MedStock — Inovatech</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  )
}
