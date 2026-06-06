import { ROLE_CONFIG, type RoleKey } from '#shared/domain'

export interface RoleStyle {
  label: string
  icon: string
  iconBg: string
  ring: string
  tag: string
  dot: string
}

const STYLES: Record<RoleKey, Omit<RoleStyle, 'label' | 'icon'>> = {
  produtor: {
    iconBg: 'bg-glm-100 text-glm-700',
    ring: 'ring-glm-200',
    tag: 'bg-glm-50 text-glm-700',
    dot: 'bg-glm-500',
  },
  cooperativa: {
    iconBg: 'bg-emerald-100 text-emerald-700',
    ring: 'ring-emerald-200',
    tag: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  transportador: {
    iconBg: 'bg-amber-100 text-amber-700',
    ring: 'ring-amber-200',
    tag: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  agroindustria: {
    iconBg: 'bg-violet-100 text-violet-700',
    ring: 'ring-violet-200',
    tag: 'bg-violet-50 text-violet-700',
    dot: 'bg-violet-500',
  },
  exportadora: {
    iconBg: 'bg-teal-100 text-teal-700',
    ring: 'ring-teal-200',
    tag: 'bg-teal-50 text-teal-700',
    dot: 'bg-teal-500',
  },
}

export function useRoleStyle() {
  const styleOf = (role: RoleKey): RoleStyle => ({
    label: ROLE_CONFIG[role].label,
    icon: ROLE_CONFIG[role].icon,
    ...STYLES[role],
  })
  return { styleOf }
}
