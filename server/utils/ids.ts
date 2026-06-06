/** Gera um ID curto e legível com prefixo, ex: genId('ofr') -> 'ofr_a1b2c3d4'. */
export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
