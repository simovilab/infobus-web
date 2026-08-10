import type {
  BucrFareAttribute,
  BucrRoute,
  BucrShapesGeoJson,
  BucrStopsGeoJson,
  BucrStopTime,
  BucrTrip
} from '../../app/types/bucr-gtfs'

/**
 * Fetches bucr's static GTFS API (raw.githubusercontent.com) server-side,
 * with a short in-memory cache and a bundled fallback copy
 * (server/assets/gtfs/) for when the remote fetch fails. See
 * scheduleProvider.ts for how this data becomes the app's GtfsRoute[]
 * shape.
 *
 * Shapes and stops are fetched as GeoJSON (shapes.geojson/stops.geojson),
 * not the raw per-row shapes.json/stops.json — bucr/build.py already builds
 * the LineString/Point geometry once, so this app doesn't re-derive it from
 * lat/lon rows itself (see the comment in app/types/bucr-gtfs.ts).
 */

const CACHE_TTL_MS = 5 * 60 * 1000

const cache = new Map<string, { data: unknown, expires: number }>()

async function loadGtfsFile<T>(filename: string): Promise<T> {
  const cached = cache.get(filename)
  if (cached && cached.expires > Date.now()) return cached.data as T

  let data: T
  try {
    const base = useRuntimeConfig().gtfsApiBase
    // raw.githubusercontent.com serves *.json/*.geojson with Content-Type:
    // text/plain, so ofetch's automatic content-type sniffing would return
    // a raw string instead of parsing it — force JSON parsing regardless.
    data = (await $fetch(`${base}${filename}`, { parseResponse: JSON.parse })) as T
  } catch {
    const raw = await useStorage('assets:server').getItem(`gtfs:${filename}`)
    if (raw == null) throw new Error(`Could not load ${filename} (remote or bundled fallback)`)
    data = (typeof raw === 'string' ? JSON.parse(raw) : raw) as T
  }

  cache.set(filename, { data, expires: Date.now() + CACHE_TTL_MS })
  return data
}

export async function loadBucrGtfs() {
  const [routes, stopsGeoJson, trips, stopTimes, shapesGeoJson, fareAttributes] = await Promise.all([
    loadGtfsFile<BucrRoute[]>('routes.json'),
    loadGtfsFile<BucrStopsGeoJson>('stops.geojson'),
    loadGtfsFile<BucrTrip[]>('trips.json'),
    loadGtfsFile<BucrStopTime[]>('stop_times.json'),
    loadGtfsFile<BucrShapesGeoJson>('shapes.geojson'),
    loadGtfsFile<BucrFareAttribute[]>('fare_attributes.json')
  ])
  return { routes, stopsGeoJson, trips, stopTimes, shapesGeoJson, fareAttributes }
}
