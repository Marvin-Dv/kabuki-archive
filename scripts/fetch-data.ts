// Ingestão de dados (Fase 1): fontes → data/raw (cache) → data/generated (schema do projeto).
//
// Uso:
//   pnpm data:fetch                      baixa as fontes e regenera data/generated
//   pnpm data:fetch --offline            usa só o cache de data/raw
//   pnpm data:fetch --baseline 2026-11-16
//        registra em data/announcements.json, com essa data de anúncio, toda
//        entidade que ainda não esteja no manifesto. Use UMA vez, para marcar o
//        conteúdo que já é público; depois ajuste à mão o que ainda for embargado.
//
// Variáveis: SRR_BASE_URL (URL ou pasta local do StarRailRes; padrão: jsDelivr).

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { collections } from '../schema'
import { createStarRailResAdapter } from './adapters/starrailres'
import type { Adapter, AdapterResult } from './adapters/types'
import { loadManifest, saveManifest, withEmbargo, type Manifest } from './lib/announcements'

const dataDir = join(import.meta.dirname, '..', 'data')
const manifestFile = join(dataDir, 'announcements.json')

const args = process.argv.slice(2)
const offline = args.includes('--offline')
const baselineIdx = args.indexOf('--baseline')
const baseline = baselineIdx >= 0 ? args[baselineIdx + 1] : undefined
if (baselineIdx >= 0 && !/^\d{4}-\d{2}-\d{2}$/.test(baseline ?? '')) {
  console.error('✗ --baseline exige uma data YYYY-MM-DD')
  process.exit(1)
}

/** slug já publicado por id: slugs não mudam, para não quebrar URLs. */
function existingSlugs(collection: string): Map<number, string> {
  const dir = join(dataDir, 'generated', collection)
  const map = new Map<number, string>()
  if (!existsSync(dir)) return map
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const json = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    if (typeof json.id === 'number' && typeof json.slug === 'string') map.set(json.id, json.slug)
  }
  return map
}

/** Grava só se mudou, para o diff do PR automático conter apenas o que mudou de fato. */
function writeIfChanged(file: string, value: unknown): boolean {
  const text = `${JSON.stringify(value, null, 2)}\n`
  if (existsSync(file) && readFileSync(file, 'utf8') === text) return false
  writeFileSync(file, text)
  return true
}

const adapters: Adapter[] = [
  createStarRailResAdapter({ characters: existingSlugs('characters'), lightcones: existingSlugs('lightcones') }),
]

const baseUrls: Record<string, string> = {
  starrailres: process.env.SRR_BASE_URL ?? 'https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master',
}

const results: AdapterResult[] = []
const failures: string[] = []
for (const adapter of adapters) {
  try {
    console.log(`→ ${adapter.name}`)
    results.push(
      await adapter.run({
        baseUrl: baseUrls[adapter.name],
        rawDir: join(dataDir, 'raw', adapter.name),
        offline,
      }),
    )
  } catch (error) {
    failures.push(`${adapter.name}: ${(error as Error).message}`)
  }
}

if (failures.length > 0) {
  console.error('✗ Falha em fonte(s) — nada foi gravado:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

// Fontes são mescladas na ordem; por ora há uma só, então apenas concatenamos por id.
const merged: Record<string, Map<number, { id: number } & Record<string, unknown>>> = {
  characters: new Map(),
  lightcones: new Map(),
}
const warnings: string[] = []
for (const result of results) {
  warnings.push(...result.warnings)
  for (const item of result.characters) merged.characters.set(item.id, item as never)
  for (const item of result.lightcones) merged.lightcones.set(item.id, item as never)
}

const manifest: Manifest = loadManifest(manifestFile)
if (baseline) {
  for (const [collection, items] of Object.entries(merged)) {
    manifest[collection] ??= {}
    for (const id of items.keys()) {
      manifest[collection][String(id)] ??= { announcedAt: baseline, patchReleaseDate: null }
    }
  }
  saveManifest(manifestFile, manifest)
}

let changed = 0
const pending: string[] = []
for (const [collection, items] of Object.entries(merged)) {
  if (!(collection in collections)) throw new Error(`coleção sem schema: ${collection}`)
  const outDir = join(dataDir, 'generated', collection)
  mkdirSync(outDir, { recursive: true })
  for (const item of items.values()) {
    const entity = withEmbargo(item as never, manifest[collection]) as { id: number; announcedAt: string | null; slug: string }
    if (!entity.announcedAt) pending.push(`${collection}/${entity.slug}`)
    if (writeIfChanged(join(outDir, `${entity.id}.json`), entity)) changed++
  }
}

const total = Object.values(merged).reduce((n, m) => n + m.size, 0)
console.log(`✓ ${total} entidade(s) processada(s), ${changed} arquivo(s) alterado(s).`)
if (pending.length > 0) {
  console.log(`⚠ ${pending.length} sem data de anúncio (não serão publicadas): ${pending.slice(0, 8).join(', ')}${pending.length > 8 ? ', ...' : ''}`)
  console.log('  Adicione-as em data/announcements.json ou rode uma vez com --baseline YYYY-MM-DD.')
}
if (warnings.length > 0) {
  console.log(`⚠ ${warnings.length} aviso(s):`)
  for (const w of warnings.slice(0, 30)) console.log(`  - ${w}`)
}
