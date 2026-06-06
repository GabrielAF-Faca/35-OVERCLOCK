/**
 * Constantes e tipos de domínio da cadeia agroindustrial GLM.
 * Compartilhado entre client (`app/`) e server (`server/`) via alias `#shared`.
 * Portado das constantes de `index_regra.html` (NC, ALLOW, CULTURAS, MESES).
 */

/** Papel no fluxo (chave minúscula usada nos nós do canvas). */
export type RoleKey =
  | 'produtor'
  | 'cooperativa'
  | 'transportador'
  | 'agroindustria'
  | 'exportadora'

/** Tipo persistido no enum `tipo_usuario` do banco. */
export type TipoUsuario =
  | 'PRODUTOR'
  | 'COOPERATIVA'
  | 'TRANSPORTADOR'
  | 'AGROINDUSTRIA'
  | 'EXPORTADORA'
  | 'ADMIN'

export interface RoleConfig {
  label: string
  tipo: Exclude<TipoUsuario, 'ADMIN'>
  /** Ícone lucide para a UI Nuxt. */
  icon: string
  /** Cor base (hex) para arestas/realces no canvas. */
  color: string
}

export const ROLES: RoleKey[] = [
  'produtor',
  'cooperativa',
  'transportador',
  'agroindustria',
  'exportadora',
]

export const ROLE_CONFIG: Record<RoleKey, RoleConfig> = {
  produtor: {
    label: 'Produtor',
    tipo: 'PRODUTOR',
    icon: 'lucide:tractor',
    color: '#16a34a',
  },
  cooperativa: {
    label: 'Cooperativa',
    tipo: 'COOPERATIVA',
    icon: 'lucide:building-2',
    color: '#2563eb',
  },
  transportador: {
    label: 'Transportador',
    tipo: 'TRANSPORTADOR',
    icon: 'lucide:truck',
    color: '#d97706',
  },
  agroindustria: {
    label: 'Agroindústria',
    tipo: 'AGROINDUSTRIA',
    icon: 'lucide:factory',
    color: '#7c3aed',
  },
  exportadora: {
    label: 'Exportadora',
    tipo: 'EXPORTADORA',
    icon: 'lucide:ship',
    color: '#0d9488',
  },
}

/** Conexões válidas: origem → destinos permitidos. (index_regra.html:2463) */
export const ALLOW: Record<RoleKey, RoleKey[]> = {
  produtor: ['cooperativa', 'transportador'],
  cooperativa: ['transportador', 'agroindustria', 'exportadora'],
  transportador: ['cooperativa', 'agroindustria', 'exportadora'],
  agroindustria: [],
  exportadora: [],
}

/** Papéis que são destino final da cadeia (recebem o cálculo de receita). */
export const DESTINOS_FINAIS: RoleKey[] = ['agroindustria', 'exportadora']

export const CULTURAS = [
  'Soja',
  'Milho',
  'Trigo',
  'Arroz',
  'Sorgo',
  'Canola',
] as const

export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const

/** Mapa enum→role e role→enum. */
const TIPO_TO_ROLE: Record<Exclude<TipoUsuario, 'ADMIN'>, RoleKey> = {
  PRODUTOR: 'produtor',
  COOPERATIVA: 'cooperativa',
  TRANSPORTADOR: 'transportador',
  AGROINDUSTRIA: 'agroindustria',
  EXPORTADORA: 'exportadora',
}

export function tipoToRole(
  tipo: TipoUsuario | null | undefined,
): RoleKey | null {
  if (!tipo || tipo === 'ADMIN') return null
  return TIPO_TO_ROLE[tipo]
}

export function roleToTipo(role: RoleKey): Exclude<TipoUsuario, 'ADMIN'> {
  return ROLE_CONFIG[role].tipo
}

export function canConnect(from: RoleKey, to: RoleKey): boolean {
  return (ALLOW[from] ?? []).includes(to)
}

/** Dados da entidade vinculada a um nó (subconjunto de Participant). */
export interface NodeEntity {
  id: string
  name: string
  cultura?: string | null
  quantidade?: number | null
  demanda?: number | null
  tonelagem?: number | null
  mes?: string | null
  cidade?: string | null
  estado?: string | null
  cotacao?: number | null
  bonus?: number | null
  descontoTransporte?: number | null
  precoPorTonelada?: number | null
}

export interface Frete {
  qtd: number
  custo: number
  label: string
}

export interface FlowNode {
  id: string
  type: RoleKey
  x: number
  y: number
  dbId: string | null
  dbData: NodeEntity | null
}

export interface FlowEdge {
  id: string
  from: string
  to: string
  frete: Frete | null
}
