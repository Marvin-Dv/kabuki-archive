// Monta a URL pública de um asset a partir do caminho salvo nos dados.
// Os dados guardam só o caminho relativo (ex.: "icon/character/1001.png"),
// então trocar de CDN é mudar esta constante.

export const ASSET_BASE = 'https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/'

export function assetUrl(path: string | undefined | null): string | null {
  if (!path) return null
  return `${ASSET_BASE}${path.replace(/^\/+/, '')}`
}
