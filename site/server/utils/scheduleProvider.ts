import type { GtfsRoute } from '../../app/types/gtfs'
import { routes as mockRoutes } from './scheduleMock'

/**
 * Único punto de origen de los horarios de bUCR. Hoy devuelve el fixture
 * mock (scheduleMock.ts). Cuando se decida la fuente real, reemplazar el
 * cuerpo de esta función por una de estas dos opciones — sin tocar
 * server/api/routes/index.get.ts, el composable useSchedule ni la página:
 *   a) descargar y parsear el .zip GTFS estático que publique databús
 *      (routes.txt/stops.txt/stop_times.txt → GtfsRoute[])
 *   b) hacer fetch al API que publique infobús y mapear su respuesta a
 *      GtfsRoute[]
 * Ambas opciones devuelven la misma forma GTFS ya usada en toda la app.
 */
export async function fetchScheduleRoutes(): Promise<GtfsRoute[]> {
  return mockRoutes
}
