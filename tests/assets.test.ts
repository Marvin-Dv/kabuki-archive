import { describe, expect, it } from 'vitest'
import { ELEMENTS, PATHS } from '../schema/constants'
import { assetUrl, elementIcon, pathIcon } from '../utils/assets'

describe('ícones do jogo', () => {
  it('o Raio usa o arquivo Thunder do StarRailRes', () => {
    expect(elementIcon('Lightning')).toBe('icon/element/Thunder.png')
  })

  it('os demais elementos usam o próprio nome', () => {
    expect(elementIcon('Quantum')).toBe('icon/element/Quantum.png')
    expect(elementIcon('Physical')).toBe('icon/element/Physical.png')
  })

  it('todo elemento e todo caminho do schema geram um caminho de ícone', () => {
    for (const element of ELEMENTS)
      expect(elementIcon(element)).toMatch(/^icon\/element\/\w+\.png$/)
    for (const path of PATHS) expect(pathIcon(path)).toBe(`icon/path/${path}Middle.png`)
  })

  it('assetUrl junta a base do CDN e ignora barras iniciais', () => {
    expect(assetUrl('/icon/path/HarmonyMiddle.png')).toMatch(
      /StarRailRes@master\/icon\/path\/HarmonyMiddle\.png$/,
    )
    expect(assetUrl(null)).toBeNull()
  })
})
