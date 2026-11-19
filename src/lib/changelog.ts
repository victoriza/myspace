import type { Lang } from './types'

/**
 * What's new, newest first. The first entry is the app's version (shown in About).
 * When you release: bump package.json, add an entry here with 2–3 short lines in ES/EN/CA.
 */
export const CHANGELOG: { version: string; notes: Record<Lang, string[]> }[] = [
  {
    version: '0.12.0',
    notes: {
      es: ['Escucha el feed de hoy: el móvil te lo cuenta como un resumen tranquilo, cosa a cosa. Lo que escuchas cuenta como visto.', 'Fuera los artículos casi vacíos: si no hay al menos 50 palabras que leer, no entran en el feed.'],
      en: ['Listen to today’s feed: your phone reads it as a calm briefing, one thing at a time. What you hear counts as seen.', 'No more near-empty articles: under 50 words to read, they stay out of the feed.'],
      ca: ['Escolta el feed d’avui: el mòbil te l’explica com un resum tranquil, cosa a cosa. El que escoltes compta com a vist.', 'Fora els articles gairebé buits: si no hi ha almenys 50 paraules per llegir, no entren al feed.'],
    },
  },
  {
    version: '0.11.0',
    notes: {
      es: ['Escucha los artículos: toca «Escuchar» bajo el título y el móvil te los lee, párrafo a párrafo.', 'Usa la voz de tu teléfono, sin internet extra. Deja la pantalla encendida mientras escuchas.'],
      en: ['Listen to articles: tap “Listen” under the title and your phone reads it to you, paragraph by paragraph.', 'It uses your phone’s own voice. Keep the screen on while you listen.'],
      ca: ['Escolta els articles: toca «Escoltar» sota el títol i el mòbil te’ls llegeix, paràgraf a paràgraf.', 'Fa servir la veu del teu telèfon. Deixa la pantalla encesa mentre escoltes.'],
    },
  },
  {
    version: '0.10.0',
    notes: {
      es: ['Comparte lo que lees con un toque, o comparte Space Feed desde Más.', '«Terminar por hoy» al final del feed, para cerrar el día sin abrirlo todo.', 'En «Quién lo hace» puedes sugerir una fuente o avisar de un fallo.'],
      en: ['Share what you read in one tap, or share Space Feed from More.', '“Finish for today” at the end of the feed, to close the day without opening everything.', 'In “Who makes it” you can suggest a source or report a bug.'],
      ca: ['Comparteix el que llegeixes amb un toc, o comparteix Space Feed des de Més.', '«Acabar per avui» al final del feed, per tancar el dia sense obrir-ho tot.', 'A «Qui el fa» pots suggerir una font o avisar d’un error.'],
    },
  },
  {
    version: '0.9.3',
    notes: {
      es: ['Más, reordenado: tu móvil, sobre Space Feed y tus datos, cada cosa en un solo sitio.', '«Añadir una fuente» ahora está en Personalizar, junto a Fuentes.'],
      en: ['More, reorganised: your phone, about Space Feed and your data, each thing in one place.', '“Add a source” now lives in Customize, next to Sources.'],
      ca: ['Més, reordenat: el teu mòbil, sobre Space Feed i les teves dades, cada cosa en un sol lloc.', '«Afegir una font» ara és a Personalitzar, al costat de Fonts.'],
    },
  },
  {
    version: '0.9.2',
    notes: {
      es: ['Algo cuenta como visto solo cuando lo abres: pasar de largo ya no lo marca.', 'Al cerrar el día, una forma tranquila de volver al feed de hoy.'],
      en: ['Something counts as seen only when you open it: scrolling past no longer marks it.', 'When the day is done, a quiet way back to today’s feed.'],
      ca: ['Una cosa compta com a vista només quan l’obres: passar de llarg ja no la marca.', 'En tancar el dia, una manera tranquil·la de tornar al feed d’avui.'],
    },
  },
  {
    version: '0.9.1',
    notes: {
      es: ['Cuando cambias algo en Personalizar, tu feed se prepara con calma: sale el sol (o la luna) sobre el mar y luego llegan las tarjetas.'],
      en: ['When you change something in Customize, your feed is prepared calmly: the sun (or the moon) rises over the sea, then the cards arrive.'],
      ca: ['Quan canvies alguna cosa a Personalitzar, el feed es prepara amb calma: surt el sol (o la lluna) sobre el mar i després arriben les targetes.'],
    },
  },
  {
    version: '0.9.0',
    notes: {
      es: [
        'De noche, toda la app se oscurece con el cielo (y si tu móvil está en modo oscuro). Lectura más cómoda: títulos con serifa, una sola etiqueta por tarjeta y una línea de progreso al leer.',
        '14 intereses: nuevos Naturaleza, Espacio, Mente y bienestar, Historia, Arte, Música y Lugares, con unas 20 fuentes nuevas (también en catalán).',
        'Al empezar eliges primero tus temas. Fuentes muestra cómo va cada una, y en Acerca de verás cómo elegimos las fuentes.',
      ],
      en: [
        'At night the whole app goes dark with the sky (and when your phone is in dark mode). Easier reading: serif titles, one label per card and a progress line while you read.',
        '14 interests: new Nature, Space, Mind & wellbeing, History, Art, Music and Places, with about 20 new sources (Catalan ones too).',
        'You pick your topics first when you start. Sources shows how each one is doing, and About explains how we choose them.',
      ],
      ca: [
        'De nit, tota l’app s’enfosqueix amb el cel (i si el mòbil és en mode fosc). Lectura més còmoda: títols amb serif, una sola etiqueta per targeta i una línia de progrés en llegir.',
        '14 interessos: nous Natura, Espai, Ment i benestar, Història, Art, Música i Llocs, amb unes 20 fonts noves (també en català).',
        'En començar tries primer els teus temes. Fonts mostra com va cadascuna, i a Sobre veuràs com triem les fonts.',
      ],
    },
  },
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
