// Regras de embargo e spoiler do Kabuki Archive.
//
// 1. Só publicamos o que já foi anunciado oficialmente (`announcedAt` no passado).
// 2. Enquanto o patch for recente (até 14 dias depois do lançamento), a página
//    exibe um aviso de spoiler. Passado o prazo, o aviso some sozinho no próximo build.

export const SPOILER_WINDOW_DAYS = 14

const DAY_MS = 24 * 60 * 60 * 1000

/** Interpreta "YYYY-MM-DD" (ou ISO completo) como UTC. Retorna null se inválido. */
function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** A entidade foi anunciada oficialmente e pode ser publicada? */
export function isPublishable(
  entity: { announcedAt?: string | null },
  now: Date = new Date(),
): boolean {
  const announced = parseDate(entity.announcedAt)
  return announced !== null && announced.getTime() <= now.getTime()
}

/** Data em que o aviso de spoiler expira (lançamento do patch + 14 dias). */
export function spoilerExpiresAt(patchReleaseDate?: string | null): Date | null {
  const release = parseDate(patchReleaseDate)
  return release ? new Date(release.getTime() + SPOILER_WINDOW_DAYS * DAY_MS) : null
}

/**
 * O aviso de spoiler deve aparecer?
 * - Sem data de lançamento conhecida: aparece (postura conservadora).
 * - Com data: aparece até 14 dias após o lançamento do patch.
 */
export function isSpoilerActive(
  patchReleaseDate?: string | null,
  now: Date = new Date(),
): boolean {
  const expires = spoilerExpiresAt(patchReleaseDate)
  if (!expires) return true
  return now.getTime() < expires.getTime()
}
