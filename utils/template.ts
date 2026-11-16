// Renderiza templates de descrição do jogo, como "Deals #1[i]% of ATK to #2[f1] enemies".
//
// Placeholder: `#<n>[<formato>]` com `%` opcional logo depois.
//   - `i`  → inteiro arredondado
//   - `fN` → N casas decimais
//   - com `%`, o valor é multiplicado por 100 (0.55 → "55%")
// `<n>` começa em 1 e indexa a linha de parâmetros do nível/rank escolhido.

const PLACEHOLDER = /#(\d+)\[(i|f(\d+))\](%?)/g

function round(value: number, digits: number): number {
  // Evita 55.00000000000001 ao multiplicar por 100.
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function renderTemplate(
  template: string,
  row: readonly number[] | undefined,
  options: { stripTags?: boolean } = {},
): string {
  let text = template
  if (row) {
    text = text.replace(PLACEHOLDER, (match, index: string, format: string, digits: string, percent: string) => {
      const raw = row[Number(index) - 1]
      if (typeof raw !== 'number' || Number.isNaN(raw)) return match // deixa visível em vez de inventar
      const value = percent ? raw * 100 : raw
      const places = format === 'i' ? 0 : Number(digits)
      return `${round(value, places).toFixed(places)}${percent}`
    })
  }
  if (options.stripTags) text = text.replace(/<\/?[a-z][^>]*>/gi, '')
  return text.replace(/\\n/g, '\n')
}

/** Quantos placeholders distintos o template usa (útil para validar `params`). */
export function placeholderCount(template: string): number {
  const found = new Set<number>()
  for (const match of template.matchAll(PLACEHOLDER)) found.add(Number(match[1]))
  return found.size
}
