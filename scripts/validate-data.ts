// Valida data/generated + data/overrides contra os schemas.
// Falha (exit 1) se algum arquivo estiver inválido, bloqueando o deploy.
// Uso: pnpm validate

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { collections } from '../schema'
import { applyOverride } from '../utils/merge'

const root = join(import.meta.dirname, '..', 'data')
let checked = 0
const errors: string[] = []

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))

for (const [name, schema] of Object.entries(collections)) {
  const generatedDir = join(root, 'generated', name)
  if (!existsSync(generatedDir)) continue

  for (const file of readdirSync(generatedDir).filter((f) => f.endsWith('.json'))) {
    const overrideFile = join(root, 'overrides', name, file)
    const base = readJson(join(generatedDir, file))
    const merged = existsSync(overrideFile) ? applyOverride(base, readJson(overrideFile)) : base

    const result = schema.safeParse(merged)
    checked++
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${name}/${file}: ${issue.path.join('.') || '(raiz)'} — ${issue.message}`)
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} problema(s) em ${checked} arquivo(s):\n`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`✓ ${checked} arquivo(s) de dados válidos.`)
