import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ELEMENTS, LOCALES, PATHS } from '../schema/constants'

// Todo caminho/elemento do schema precisa de nome em todos os idiomas. Sem isso, um
// caminho novo (como o Elation) apareceria no filtro com a chave crua, ex.: "paths.Elation".
const load = (locale: string) =>
  JSON.parse(readFileSync(join(import.meta.dirname, '..', 'locales', `${locale}.json`), 'utf8'))

describe('locales', () => {
  for (const locale of LOCALES) {
    it(`${locale}: tem nome para todo caminho e elemento`, () => {
      const messages = load(locale)
      for (const path of PATHS) expect(typeof messages.paths?.[path]).toBe('string')
      for (const element of ELEMENTS) expect(typeof messages.elements?.[element]).toBe('string')
    })

    it(`${locale}: os nomes de caminhos são todos diferentes entre si`, () => {
      const names = Object.values(load(locale).paths as Record<string, string>)
      expect(new Set(names).size).toBe(names.length)
    })
  }
})
