// Gera data/built/characters.json: o índice enxuto usado pela lista do site.
// Roda antes de `nuxt dev/build/generate` (ver package.json). Aplica os overrides,
// valida contra o schema e descarta o que ainda não foi anunciado (embargo).
// Uso: pnpm data:index

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { character, type Character } from '../schema'
import { buildCharacterIndex } from '../utils/catalog'
import { applyOverride } from '../utils/merge'

const root = join(import.meta.dirname, '..', 'data')
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))

const generatedDir = join(root, 'generated', 'characters')
const files = existsSync(generatedDir)
  ? readdirSync(generatedDir).filter((f) => f.endsWith('.json'))
  : []

const entities: Character[] = []
const errors: string[] = []
for (const file of files) {
  const overrideFile = join(root, 'overrides', 'characters', file)
  const base = readJson(join(generatedDir, file))
  const merged = existsSync(overrideFile) ? applyOverride(base, readJson(overrideFile)) : base
  const parsed = character.safeParse(merged)
  if (parsed.success) entities.push(parsed.data)
  else errors.push(`characters/${file}: ${parsed.error.issues[0]?.message ?? 'inválido'}`)
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} arquivo(s) inválido(s):\n  - ${errors.join('\n  - ')}`)
  process.exit(1)
}

const index = buildCharacterIndex(entities)
const outDir = join(root, 'built')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'characters.json'), JSON.stringify(index))

const hidden = entities.length - index.length
console.log(
  `✓ índice de personagens: ${index.length} publicado(s)` +
    (hidden > 0 ? `, ${hidden} oculto(s) por embargo (sem anúncio)` : ''),
)
