import { describe, expect, it } from 'vitest'
import { formatJson, stringifyData } from '../scripts/lib/format'

describe('formatJson', () => {
  const sample = {
    id: 1001,
    name: { en: 'March 7th', 'pt-BR': '7 de Março' },
    params: [[0.5], [0.6], [0.7]],
    materials: [
      { id: 2, num: 4000 },
      { id: 110141, num: 2 },
    ],
    empty: [],
    emptyObj: {},
    nothing: null,
    text: 'linha\ncom "aspas" e acentos: ção',
    flag: false,
  }

  it('é JSON válido que volta idêntico', () => {
    expect(JSON.parse(formatJson(sample))).toEqual(sample)
  })

  it('mantém em uma linha o que cabe em 100 colunas', () => {
    expect(formatJson({ a: [1, 2, 3] })).toBe('{ "a": [1, 2, 3] }')
    expect(formatJson([{ id: 2, num: 4000 }])).toBe('[{ "id": 2, "num": 4000 }]')
  })

  it('quebra o que passa de 100 colunas, uma entrada por linha', () => {
    const long = { items: Array.from({ length: 12 }, (_, i) => ({ id: 100000 + i, num: i + 1000 })) }
    const text = formatJson(long)
    expect(text.split('\n').length).toBeGreaterThan(5)
    expect(text.split('\n').every((line) => line.length <= 100)).toBe(true)
    expect(JSON.parse(text)).toEqual(long)
  })

  it('ignora campos undefined, como o JSON.stringify', () => {
    expect(formatJson({ a: 1, b: undefined })).toBe('{ "a": 1 }')
  })

  it('é estável: formatar duas vezes dá o mesmo texto', () => {
    const once = stringifyData(sample)
    expect(stringifyData(JSON.parse(once))).toBe(once)
    expect(once.endsWith('\n')).toBe(true)
  })

  it('texto longo (descrições) não é quebrado', () => {
    const description = 'x'.repeat(300)
    expect(formatJson({ description })).toContain(description)
  })
})
