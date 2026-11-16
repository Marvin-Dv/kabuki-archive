// Merge profundo usado para aplicar `data/overrides/` por cima de `data/generated/`.
// - Objetos são mesclados chave a chave.
// - Arrays e valores simples do override substituem o original por completo.
// - `null` no override remove o campo.

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

const isPlainObject = (value: unknown): value is { [key: string]: Json } =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function applyOverride<T extends Json>(base: T, override: Json | undefined): T {
  if (override === undefined) return base
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T

  const result: { [key: string]: Json } = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (value === null) {
      delete result[key]
    } else {
      result[key] = applyOverride(result[key] ?? null, value)
    }
  }
  return result as T
}
