const moneyFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const numberFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export function useFormat() {
  return {
    money: (value: number | string) => moneyFmt.format(Number(value)),
    number: (value: number | string) => numberFmt.format(Number(value)),
  }
}
