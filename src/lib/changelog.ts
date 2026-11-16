import type { Lang } from './types'

/**
 * What's new, newest first. The first entry is the app's version (shown in About).
 * When you release: bump package.json, add an entry here with 2–3 short lines in ES/EN/CA.
 */
export const CHANGELOG: { version: string; notes: Record<Lang, string[]> }[] = [
  {
    version: '0.4.0',
    notes: {
      es: [
        'Aviso discreto cuando hay una nueva versión, sin cortarte la lectura.',
        '“Ocultado hoy” en Filtros: mira qué ha apartado el filtro y por qué.',
        'Los vídeos muestran su duración real, y “¿No te interesa?” quita una fuente.',
      ],
      en: [
        'A quiet notice when a new version is ready, without interrupting your reading.',
        '“Hidden today” in Filters: see what the filter set aside and why.',
        'Videos show their real length, and “Not interested?” removes a source.',
      ],
      ca: [
        'Avís discret quan hi ha una versió nova, sense tallar-te la lectura.',
        '“Amagat avui” a Filtres: mira què ha apartat el filtre i per què.',
        'Els vídeos mostren la durada real, i “No t’interessa?” treu una font.',
      ],
    },
  },
]

export const APP_VERSION = CHANGELOG[0].version

/** Compares "1.2.3" versions: negative if a < b. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0)
  return 0
}

/** Changelog entries newer than the version the person last saw (at most 2). */
export function notesSince(lastSeen: string | null): typeof CHANGELOG {
  if (!lastSeen) return CHANGELOG.slice(0, 1)
  return CHANGELOG.filter((e) => compareVersions(e.version, lastSeen) > 0).slice(0, 2)
}
