// Manifesto de anúncios: data/announcements.json (editado à mão, versionado).
//
// As fontes de dados NÃO informam quando algo foi anunciado oficialmente, e o
// StarRailRes costuma conter conteúdo extraído do cliente antes do anúncio.
// Por isso a ingestão nunca preenche `announcedAt` sozinha: ela lê daqui.
// Entidade fora do manifesto fica com `announcedAt: null` → não é publicada.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { z } from 'zod'
import { embargoFields } from '../../schema'

const entry = z.object({
  announcedAt: embargoFields.announcedAt,
  patchReleaseDate: embargoFields.patchReleaseDate,
  version: embargoFields.version,
})
export type AnnouncementEntry = z.infer<typeof entry>

const manifestSchema = z.record(z.string(), z.record(z.string(), entry))
/** coleção → id → entrada. Ex.: { characters: { "1001": { announcedAt: "2023-04-26" } } } */
export type Manifest = z.infer<typeof manifestSchema>

export function loadManifest(file: string): Manifest {
  if (!existsSync(file)) return {}
  return manifestSchema.parse(JSON.parse(readFileSync(file, 'utf8')))
}

export function saveManifest(file: string, manifest: Manifest): void {
  const sorted: Manifest = {}
  for (const collection of Object.keys(manifest).sort()) {
    sorted[collection] = Object.fromEntries(
      Object.entries(manifest[collection]).sort(([a], [b]) => Number(a) - Number(b)),
    )
  }
  writeFileSync(file, `${JSON.stringify(sorted, null, 2)}\n`)
}

/** Aplica o manifesto a uma entidade (sem mexer se o id não estiver nele). */
export function withEmbargo<T extends { id: number; announcedAt: string | null; patchReleaseDate: string | null; version?: string }>(
  entity: T,
  entries: Record<string, AnnouncementEntry> | undefined,
): T {
  const found = entries?.[String(entity.id)]
  if (!found) return entity
  return {
    ...entity,
    announcedAt: found.announcedAt,
    patchReleaseDate: found.patchReleaseDate,
    ...(found.version ? { version: found.version } : {}),
  }
}
