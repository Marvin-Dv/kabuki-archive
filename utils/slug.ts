// Gera slugs ASCII estáveis para URLs a partir do nome em inglês.

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/['’`]/g, '') // "Dan Heng's" → "dan hengs"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Slug único dentro de uma coleção. Se o slug base já estiver em uso (ou ficar
 * vazio, como em nomes só com símbolos), acrescenta o ID: "nome-1234".
 */
export function uniqueSlug(name: string, id: number, taken: Set<string>): string {
  const base = slugify(name)
  const slug = base && !taken.has(base) ? base : base ? `${base}-${id}` : `item-${id}`
  taken.add(slug)
  return slug
}
