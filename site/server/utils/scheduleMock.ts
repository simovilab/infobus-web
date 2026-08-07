import type { GtfsRoute, GtfsStop } from '../../app/types/gtfs'

/**
 * Mock GTFS-shaped fixture for bUCR (UCR's internal campus bus). Stands in
 * for the real schedule source until that's decided (a GTFS static .zip
 * published by databús, or an API published by infobús — see
 * scheduleProvider.ts, the single place that decision plugs in).
 *
 * Stop names/ids/coordinates, route names/colors, schedules, and stop
 * descriptions come from the real published GTFS feed and from bucr-web
 * (github.com/simovilab/bucr-web, index.html + rama redesignStops'
 * js/bucr.js) — not invented, except where noted below.
 *
 * The real feed models the service as one continuous loop (outbound via
 * the "bUCR_0_*" stops, return via the "bUCR_1_*" stops on a different
 * street). "L1" (sin milla) and "L2" (con milla) differ only in whether
 * the outbound leg detours through la milla universitaria; only L1 runs a
 * return trip in the real feed (L2 is outbound-only). To keep this a
 * simple fixture, only one representative trip per (route, direction) is
 * represented — not the full day's departures.
 *
 * The three outbound trips' intermediate stop times are real
 * (stop_times.txt). The L1 return trip's origin time (07:00) and final
 * stop (Educación) are real (bucr-web's "Desde Deportivas" table); its
 * intermediate times are illustrative pacing, not sourced from the feed.
 *
 * Pendiente / a considerar más adelante (no implementado aún):
 * - Es posible que el servicio real pase a ofrecerse como una sola ruta
 *   en vez de L1/L2 — si eso se confirma, ajustar cuántas pestañas de
 *   horario/mapa se generan por dirección.
 * - La sección de Mapas hoy solo lista las paradas en orden (sin
 *   geometría). Ya está preparado el terreno para el mapa en escala de
 *   grises (MapLibre + estilo "positron" de OpenFreeMap) que usa
 *   feat/bucr-static-site — dependencia `maplibre-gl`, su CSS y el
 *   preconnect a tiles.openfreemap.org ya están en package.json/
 *   nuxt.config.ts. Falta portar el componente
 *   `site/app/components/home/CampusLiveMap.client.vue` de esa rama (recibe
 *   `routes: GtfsRoute[]` y dibuja línea+paradas desde stop.lat/lon —
 *   funciona sin `route.shape`, cae a línea recta parada-a-parada si no
 *   hay geometría) y reemplazar el `<UPageList>` de esta sección por él.
 *   La animación de carga (`.map-spinner` + `@keyframes map-spin`, para
 *   el hueco SSR→hidratación y la carga de tiles) ya está en main.css,
 *   lista para cuando el componente use `v-if="!isLoaded"`.
 */

// Base stop identity (id/name/geometry/accessibility/description) —
// shared between trips that serve the same physical stop. Per-trip
// scheduling (scheduled_time) is real GTFS stop_times.txt territory: a
// join on (trip, stop), not a property of the stop itself — so each trip
// below clones from here and adds its own trip-specific time.
const baseStops = {
  educacion: {
    id: 'bUCR_0_01', name: 'Educación', lat: 9.935610136323218, lon: -84.04899295728595, terminal: true,
    wheelchair_boarding: 1 as const, platform_features: ['Andén con techo'],
    description: 'Frente al jardín de la Facultad de Educación (FE)'
  },
  salud: {
    id: 'bUCR_0_03', name: 'Ciencias de la Salud', lat: 9.93860832346218, lon: -84.0517499001992,
    wheelchair_boarding: 1 as const, platform_features: ['Andén con techo'],
    description: 'Frente al antiguo edificio de la Facultad de Odontología (FOd), diagonal al parqueo de la Biblioteca de Ciencias de la Salud'
  },
  microbiologia: {
    id: 'bUCR_0_04', name: 'Microbiología', lat: 9.93832361909286, lon: -84.04876049840074,
    wheelchair_boarding: 1 as const, platform_features: ['Andén con techo'],
    description: 'Esquina noreste del parqueo de las Escuelas de Artes Musicales (EAM), Química (EQ) y Biología (EB) y la Facultad de Microbiología (FMic)'
  },
  lanamme: {
    id: 'bUCR_LA', name: 'LanammeUCR', lat: 9.935785141707278, lon: -84.04544067497328, wheelchair_boarding: 1 as const,
    description: 'Junto al parqueo del Centro de Transferencia Tecnológica (CTT), diagonal al Laboratorio Nacional de Materiales y Modelos Estructurales (LANAMME)'
  },
  ingenieria: {
    id: 'bUCR_FI', name: 'Facultad de Ingeniería', lat: 9.937467311441507, lon: -84.04467644300775, wheelchair_boarding: 1 as const,
    description: 'Costado norte del nuevo edificio de la Facultad de Ingeniería (FI)'
  },
  cienciasSociales: {
    id: 'bUCR_CS', name: 'Facultad de Ciencias Sociales', lat: 9.938130529026141, lon: -84.04229551510366,
    display_coords: '9.9381, −84.0423', zone: 'Ciudad de la Investigación', wheelchair_boarding: 1 as const,
    alert: 'Traslado temporal del 4 al 8 de agosto. Por obras en la acera, la parada se traslada 60 m al oeste, frente al Instituto de Investigaciones Sociales.',
    description: 'Entre la Facultad de Ciencias Sociales (FCS) y el edificio de parqueos'
  },
  inie: {
    id: 'bUCR_0_08', name: 'INIE', lat: 9.939451647823137, lon: -84.04307776266035, wheelchair_boarding: 2 as const,
    description: 'Costado sur del edificio del Instituto de Investigación en Educación (INIE)'
  },
  cicica: {
    id: 'bUCR_0_09', name: 'CICICA', lat: 9.940155168862551, lon: -84.04450675690296, wheelchair_boarding: 2 as const,
    description: 'Costado sur del edificio del Centro de Investigación en Cirugía y Cáncer (CICICA)'
  },
  obs: {
    id: 'bUCR_0_10', name: 'OBS', lat: 9.9437612204, lon: -84.0446834625, wheelchair_boarding: 2 as const,
    description: 'En el nuevo edificio de la Oficina de Bienestar y Salud, junto al Estadio Ecológico'
  },
  odontologia: {
    id: 'bUCR_1_01', name: 'Facultad de Odontología', lat: 9.946441050827925, lon: -84.0451915613564, terminal: true, wheelchair_boarding: 2 as const,
    description: 'En el nuevo edificio de la Facultad de Odontología (FOd) en la Finca 3'
  },
  // Return-only stops (Finca 3 → Finca 1) — not served on the outbound leg.
  edufi: {
    id: 'bUCR_1_02', name: 'EDUFI', lat: 9.943381444081362, lon: -84.04495180739714, wheelchair_boarding: 2 as const,
    description: 'Costado este de las canchas multiuso y de la Escuela de Educación Física y Deportes (EDUFI)'
  },
  nutricion: {
    id: 'bUCR_1_03', name: 'Nutrición', lat: 9.939134591559855, lon: -84.04468654565294, wheelchair_boarding: 2 as const,
    description: 'Esquina noreste del edificio de la Escuela de Nutrición (ENu)'
  },
  cimarAuditorio: {
    id: 'bUCR_1_04', name: 'CIMAR / Auditorio', lat: 9.938980381389706, lon: -84.0436758508172, wheelchair_boarding: 2 as const,
    description: 'Entre el edificio de parqueos, el Auditorio de la Ciudad de la Investigación y el Centro de Investigación en Ciencias del Mar y Limnología (CIMAR)'
  },
  cimpa: {
    id: 'bUCR_1_05', name: 'CIMPA', lat: 9.939472792042086, lon: -84.042189216776, wheelchair_boarding: 2 as const,
    description: 'Frente al edificio del Centro de Investigación en Matemática Pura y Aplicada (CIMPA)'
  },
  // Ingeniería/LANAMME have their own return-direction stop (opposite curb).
  ingenieriaSuroeste: {
    id: 'bUCR_1_06', name: 'Facultad de Ingeniería', lat: 9.937468669419962, lon: -84.04501822768842, wheelchair_boarding: 1 as const,
    description: 'Costado norte del nuevo edificio de la Facultad de Ingeniería (FI), al otro lado de la calle'
  },
  lanammeSuroeste: {
    id: 'bUCR_1_07', name: 'LanammeUCR', lat: 9.93589305371453, lon: -84.04546950911886, wheelchair_boarding: 1 as const,
    description: 'Junto al parqueo del CTT, diagonal al LANAMME, al otro lado de la calle'
  }
} satisfies Record<string, GtfsStop>

function withTimes(stop: GtfsStop, scheduled: string): GtfsStop {
  return { ...stop, scheduled_time: scheduled }
}

// Real stop_times.txt sequence for trip desde_educacion_sin_milla_entresemana_07:00.
const stopsL1: GtfsStop[] = [
  withTimes(baseStops.educacion, '07:00'),
  withTimes(baseStops.lanamme, '07:08'),
  withTimes(baseStops.ingenieria, '07:09'),
  withTimes(baseStops.cienciasSociales, '07:11'),
  withTimes(baseStops.inie, '07:14'),
  withTimes(baseStops.cicica, '07:15'),
  withTimes(baseStops.obs, '07:18'),
  withTimes(baseStops.odontologia, '07:20')
]

// Real stop_times.txt sequence for trip desde_educacion_con_milla_entresemana_19:15
// (the con-milla variant only runs in the evening in the real schedule).
const stopsL2: GtfsStop[] = [
  withTimes(baseStops.educacion, '19:15'),
  withTimes(baseStops.salud, '19:19'),
  withTimes(baseStops.microbiologia, '19:21'),
  withTimes(baseStops.lanamme, '19:26'),
  withTimes(baseStops.ingenieria, '19:27'),
  withTimes(baseStops.cienciasSociales, '19:29'),
  withTimes(baseStops.inie, '19:32'),
  withTimes(baseStops.cicica, '19:33'),
  withTimes(baseStops.obs, '19:36'),
  withTimes(baseStops.odontologia, '19:38')
]

// L1 return trip (Finca 3 → Finca 1). Origin time (07:00) and final stop
// (Educación) are real (bucr-web's "Desde Deportivas" table); intermediate
// times are illustrative pacing only — see file header note.
const stopsL1Back: GtfsStop[] = [
  withTimes(baseStops.odontologia, '07:00'),
  withTimes(baseStops.edufi, '07:03'),
  withTimes(baseStops.nutricion, '07:06'),
  withTimes(baseStops.cimarAuditorio, '07:08'),
  withTimes(baseStops.cimpa, '07:10'),
  withTimes(baseStops.cienciasSociales, '07:13'),
  withTimes(baseStops.ingenieriaSuroeste, '07:15'),
  withTimes(baseStops.lanammeSuroeste, '07:17'),
  withTimes(baseStops.educacion, '07:23')
]

export const routes: GtfsRoute[] = [
  {
    route_id: 'L1',
    route_short_name: 'L1',
    route_long_name: 'Bus interno UCR sin milla',
    route_desc: 'Conecta las tres fincas del Campus Rodrigo Facio sin la vuelta por la milla universitaria.',
    route_type: 3,
    route_color: '00C0F3',
    direction_id: 0,
    tramo: 'Lanamme · Ingeniería · Ciencias Sociales · Odontología',
    frequency_minutes: 20,
    status: 'Servicio normal',
    status_level: 'ok',
    direction_destinations: ['Facultad de Odontología', 'Educación'],
    distance_km: 3.8,
    service_hours: 'Lunes a viernes 6:10 – 18:50',
    first_bus: '06:10',
    last_bus: '18:50',
    peak_frequency_minutes: 10,
    offpeak_frequency_minutes: 30,
    fare: 'Gratuito',
    fare_note: 'Para toda la comunidad universitaria',
    stops: stopsL1
  },
  {
    route_id: 'L2',
    route_short_name: 'L2',
    route_long_name: 'Bus interno UCR con milla',
    route_desc: 'Conecta las tres fincas del Campus Rodrigo Facio e incluye la vuelta por la milla universitaria.',
    route_type: 3,
    route_color: '005DA4',
    direction_id: 0,
    tramo: 'Ciencias de la Salud · Microbiología · Lanamme · Odontología',
    frequency_minutes: 25,
    status: 'Servicio nocturno',
    status_level: 'ok',
    direction_destinations: ['Facultad de Odontología', 'Educación'],
    distance_km: 4.3,
    service_hours: 'Lunes a viernes 19:00 – 21:35',
    first_bus: '19:00',
    last_bus: '21:35',
    peak_frequency_minutes: 15,
    offpeak_frequency_minutes: 35,
    fare: 'Gratuito',
    fare_note: 'Para toda la comunidad universitaria',
    stops: stopsL2
  },
  {
    route_id: 'L1',
    route_short_name: 'L1',
    route_long_name: 'Bus interno UCR sin milla',
    route_desc: 'Regreso hacia Educación y Artes Plásticas, sin vuelta por la milla universitaria.',
    route_type: 3,
    route_color: '00C0F3',
    direction_id: 1,
    tramo: 'EDUFI · Nutrición · CIMAR · CIMPA · Ciencias Sociales',
    frequency_minutes: 20,
    status: 'Servicio normal',
    status_level: 'ok',
    direction_destinations: ['Educación', 'Facultad de Odontología'],
    service_hours: 'Lunes a viernes 6:20 – 19:00',
    fare: 'Gratuito',
    fare_note: 'Para toda la comunidad universitaria',
    stops: stopsL1Back
  }
]

// Derive transfer_routes per route-stop-entry: a stop shared by both L1 and
// L2 must show a *different* transfer target depending on which route's own
// stop list you're looking at, and withTimes() clones a fresh object per
// route so this is safe to mutate.
for (const route of routes) {
  for (const stop of route.stops) {
    const others = routes.filter(r => r.route_id !== route.route_id && r.stops.some(s => s.id === stop.id))
    stop.transfer_routes = others.length ? others.map(r => r.route_id) : undefined
  }
}
