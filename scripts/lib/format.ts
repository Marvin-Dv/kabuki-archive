// Formata JSON de forma compacta e estável para data/generated.
// O JSON.stringify(_, null, 2) quebra cada número de um array em uma linha, e as
// árvores de traços (centenas de materiais por personagem) ficariam enormes no git.
// Aqui, o que cabe em 100 colunas fica em uma linha só; o resto quebra por nível.

type Json = null | boolean | number | string | Json[] | { [key: string]: Json | undefined }

const MAX_WIDTH = 100

const entriesOf = (value: { [key: string]: Json | undefined }): Array<[string, Json]> =>
  Object.entries(value).filter((entry): entry is [string, Json] => entry[1] !== undefined)

/** Versão em uma linha só (não verifica largura). */
function inline(value: Json): string {
  if (Array.isArray(value)) return value.length ? `[${value.map(inline).join(', ')}]` : '[]'
  if (value !== null && typeof value === 'object') {
    const entries = entriesOf(value)
    return entries.length
      ? `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${inline(v)}`).join(', ')} }`
      : '{}'
  }
  return JSON.stringify(value)
}

export function formatJson(value: Json, indent = 0): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  const flat = inline(value)
  if (flat.length + indent <= MAX_WIDTH) return flat

  const pad = ' '.repeat(indent + 2)
  const end = ' '.repeat(indent)
  if (Array.isArray(value)) {
    return `[\n${value.map((item) => `${pad}${formatJson(item, indent + 2)}`).join(',\n')}\n${end}]`
  }
  const lines = entriesOf(value).map(([k, v]) => `${pad}${JSON.stringify(k)}: ${formatJson(v, indent + 2)}`)
  return `{\n${lines.join(',\n')}\n${end}}`
}

/** Documento completo: com quebra de linha final. */
export const stringifyData = (value: unknown): string => `${formatJson(value as Json)}\n`
