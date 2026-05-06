import { UserRole } from '@/store/authStore'

// ─── Tipos de permissão ───────────────────────────────────────────────────────

export type Permission =
  | 'view:dashboard'
  | 'view:medicamentos' | 'create:medicamentos' | 'edit:medicamentos' | 'delete:medicamentos'
  | 'view:entradas'     | 'create:entradas'
  | 'view:saidas'       | 'create:saidas'
  | 'view:estoque'
  | 'view:alertas'
  | 'view:relatorios'   | 'create:relatorios'
  | 'view:colaboradores'| 'create:colaboradores'| 'edit:colaboradores'| 'delete:colaboradores'
  | 'view:fornecedores' | 'create:fornecedores' | 'edit:fornecedores' | 'delete:fornecedores'
  | 'view:unidades'     | 'create:unidades'
  | 'view:configuracoes'| 'edit:configuracoes'

// ─── Mapa de permissões por papel ─────────────────────────────────────────────

const PERMISSIONS: Record<UserRole, Permission[]> = {
  /**
   * ADMIN — acesso total ao sistema.
   * Único papel que pode cadastrar colaboradores, gerenciar unidades e configurações.
   */
  admin: [
    'view:dashboard',
    'view:medicamentos', 'create:medicamentos', 'edit:medicamentos', 'delete:medicamentos',
    'view:entradas',      'create:entradas',
    'view:saidas',        'create:saidas',
    'view:estoque',
    'view:alertas',
    'view:relatorios',    'create:relatorios',
    'view:colaboradores', 'create:colaboradores', 'edit:colaboradores', 'delete:colaboradores',
    'view:fornecedores',  'create:fornecedores',  'edit:fornecedores',  'delete:fornecedores',
    'view:unidades',      'create:unidades',
    'view:configuracoes', 'edit:configuracoes',
  ],

  /**
   * FARMACÊUTICO — gestão completa do estoque e medicamentos.
   * Não acessa cadastro de colaboradores nem unidades.
   */
  farmaceutico: [
    'view:dashboard',
    'view:medicamentos', 'create:medicamentos', 'edit:medicamentos',
    'view:entradas',     'create:entradas',
    'view:saidas',       'create:saidas',
    'view:estoque',
    'view:alertas',
    'view:relatorios',   'create:relatorios',
    'view:fornecedores', 'create:fornecedores', 'edit:fornecedores',
    'view:configuracoes',
  ],

  /**
   * MÉDICO — somente leitura. Consulta estoque e gera relatórios.
   * Não registra movimentações nem edita cadastros.
   */
  medico: [
    'view:dashboard',
    'view:medicamentos',
    'view:estoque',
    'view:alertas',
    'view:relatorios',
  ],

  /**
   * ENFERMEIRO — registra entradas e saídas do dia a dia.
   * Não cadastra medicamentos nem acessa relatórios gerenciais.
   */
  enfermeiro: [
    'view:dashboard',
    'view:medicamentos',
    'view:entradas', 'create:entradas',
    'view:saidas',   'create:saidas',
    'view:estoque',
    'view:alertas',
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Verifica se um papel possui uma permissão específica */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false
  return PERMISSIONS[role]?.includes(permission) ?? false
}

/** Verifica se um papel pode visualizar uma seção pelo nome da rota */
export function canAccess(role: UserRole | undefined, section: string): boolean {
  return hasPermission(role, `view:${section}` as Permission)
}

/** Retorna o rótulo amigável para cada papel */
export function roleLabel(role: UserRole | undefined): string {
  const labels: Record<UserRole, string> = {
    admin: 'Administrador',
    farmaceutico: 'Farmacêutico',
    medico: 'Médico',
    enfermeiro: 'Enfermeiro',
  }
  return role ? (labels[role] ?? role) : 'Usuário'
}
