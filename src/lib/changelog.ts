import type { Lang } from './types'

/**
 * What's new, newest first. The first entry is the app's version (shown in About).
 * When you release: bump package.json, add an entry here with 2–3 short lines in ES/EN/CA.
 */
export const CHANGELOG: { version: string; notes: Record<Lang, string[]> }[] = [
  {
    version: '0.8.1',
    notes: {
      es: ['Vuelven los vídeos: cada día tiene su hueco para 1 o 2, como las imágenes, y ya no se cuelan Shorts.'],
      en: ['Videos are back: each day keeps a place for 1 or 2, like pictures, and no more Shorts sneaking in.'],
      ca: ['Tornen els vídeos: cada dia té lloc per a 1 o 2, com les imatges, i ja no s’hi colen Shorts.'],
    },
  },
  {
    version: '0.8.0',
    notes: {
      es: [
        'Más accesible: cada pantalla se anuncia al lector de pantalla, los títulos en otro idioma se leen bien y todo cabe con letra grande.',
        'Textos más cortos y claros, y un cielo que siempre se lee bien, a cualquier hora.',
      ],
      en: [
        'More accessible: each screen is announced to screen readers, titles in other languages are read correctly and everything fits with large text.',
        'Shorter, clearer copy, and a sky that stays readable at any hour.',
      ],
      ca: [
        'Més accessible: cada pantalla s’anuncia al lector de pantalla, els títols en altres idiomes es llegeixen bé i tot hi cap amb lletra gran.',
        'Textos més curts i clars, i un cel que sempre es llegeix bé, a qualsevol hora.',
      ],
    },
  },
  {
    version: '0.7.0',
    notes: {
      es: [
        'Tu inicio tiene cielo: amanecer, día, atardecer y noche según la hora, con sol, luna, nubes y estrellas.',
        'Al hacer scroll, las tarjetas pasan por encima del cielo; las olas se mueven despacio en el horizonte.',
      ],
      en: [
        'Your home has a sky now: dawn, day, sunset and night by the hour, with sun, moon, clouds and stars.',
        'As you scroll, the cards slide over the sky; the waves drift slowly along the horizon.',
      ],
      ca: [
        'El teu inici té cel: alba, dia, posta i nit segons l’hora, amb sol, lluna, núvols i estrelles.',
        'En fer scroll, les targetes passen per sobre del cel; les onades es mouen a poc a poc a l’horitzó.',
      ],
    },
  },
  {
    version: '0.6.0',
    notes: {
      es: [
        'Nuevo en Personalizar: “Intereses”. Activa o desactiva temas como Ciencia, Planeta o Cultura.',
        'Nuevo tema: Videojuegos (desactivado al principio): cómo se hacen los juegos y su cultura, sin guías ni polémicas.',
      ],
      en: [
        'New in Customize: “Interests”. Switch topics like Science, Planet or Culture on or off.',
        'New topic: Videogames (off to start): how games are made and their culture, no guides or drama.',
      ],
      ca: [
        'Nou a Personalitzar: “Interessos”. Activa o desactiva temes com Ciència, Planeta o Cultura.',
        'Nou tema: Videojocs (desactivat al principi): com es fan els jocs i la seva cultura, sense guies ni polèmiques.',
      ],
    },
  },
  {
    version: '0.5.1',
    notes: {
      es: ['Hemos quitado los accesos a Instagram y TikTok: Space Feed es tu rato tranquilo, sin puertas a feeds infinitos.'],
      en: ['We removed the Instagram and TikTok shortcuts: Space Feed is your calm moment, with no doors to endless feeds.'],
      ca: ['Hem tret els accessos a Instagram i TikTok: Space Feed és la teva estona tranquil·la, sense portes a feeds infinits.'],
    },
  },
  {
    version: '0.5.0',
    notes: {
      es: [
        'Más acogedor: un saludo según la hora y colores que se templan a lo largo del día.',
        'Las tarjetas llegan con suavidad y el punto se convierte en ✓ al verlas.',
        'Al terminar, el sol se pone sobre el mar y salen las estrellas.',
      ],
      en: [
        'Cosier: a greeting for the time of day and colours that warm up as the day goes on.',
        'Cards arrive gently, and the dot turns into a ✓ once you’ve seen them.',
        'When you finish, the sun sets over the sea and the stars come out.',
      ],
      ca: [
        'Més acollidor: una salutació segons l’hora i colors que s’escalfen al llarg del dia.',
        'Les targetes arriben amb suavitat i el punt es converteix en ✓ quan les veus.',
        'En acabar, el sol es pon sobre el mar i surten les estrelles.',
      ],
    },
  },
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
