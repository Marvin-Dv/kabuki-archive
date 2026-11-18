import type { ElementName, PathName } from '../schema/constants'

// Monta a URL pública de um asset a partir do caminho salvo nos dados.
// Os dados guardam só o caminho relativo (ex.: "icon/character/1001.png"),
// então trocar de CDN é mudar esta constante.

export const ASSET_BASE = 'https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/'

export function assetUrl(path: string | undefined | null): string | null {
  if (!path) return null
  return `${ASSET_BASE}${path.replace(/^\/+/, '')}`
}

// Ícones oficiais do jogo (StarRailRes).
// Caminhos: versão "Middle" (128 px, branca, sem fundo). Elementos: arquivo colorido.
// O jogo chama o elemento Raio de "Thunder".

export function elementIcon(element: ElementName): string {
  return `icon/element/${element === 'Lightning' ? 'Thunder' : element}.png`
}

export function pathIcon(path: PathName): string {
  return `icon/path/${path}Middle.png`
}
