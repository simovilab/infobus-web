import { createHash } from 'node:crypto'
import type {
  BucrFareAttribute,
  BucrRoute,
  BucrShapeFeature,
  BucrShapesGeoJson,
  BucrStopFeature,
  BucrStopsGeoJson,
  BucrStopTime,
  BucrTrip
} from '../../app/types/bucr-gtfs'
import { parseCsv } from './csv'
import { unzip } from './zip'

/**
 * Fetches and parses bUCR's real GTFS feed (feeds.simovi.org/bucr/schedule/gtfs.zip)
 * server-side — the single source of truth, published by the `bucr` repo's
 * build.py, no longer read via the pre-built api/*.json files on GitHub.
 *
 * syncGtfsZip() is hash-gated (sha256 of the downloaded zip bytes): if the
 * feed hasn't changed since the last sync, the cached parsed data is
 * returned as-is instead of re-parsing. server/plugins/gtfsSync.ts calls
 * this once on server start and then hourly; requests in between just read
 * the in-memory cache. See scheduleProvider.ts for how this data becomes
 * the app's GtfsRoute[] shape.
 *
 * Shapes and stops are converted to GeoJSON here (shapes.geojson/
 * stops.geojson's shape, following the same convention bucr/build.py's
 * build_geojson() uses) so nothing downstream re-derives LineString/Point
 * geometry from raw lat/lon rows itself.
 */

export interface BucrGtfsData {
  routes: BucrRoute[]
  stopsGeoJson: BucrStopsGeoJson
  trips: BucrTrip[]
  stopTimes: BucrStopTime[]
  shapesGeoJson: BucrShapesGeoJson
  fareAttributes: BucrFareAttribute[]
}

let cachedHash: string | null = null
let cachedData: BucrGtfsData | null = null
let inFlight: Promise<BucrGtfsData> | null = null

function readTable<T>(entries: Map<string, Buffer>, name: string, required: true): T
function readTable<T>(entries: Map<string, Buffer>, name: string, required: false): T | undefined
function readTable<T>(entries: Map<string, Buffer>, name: string, required: boolean): T | undefined {
  const entry = entries.get(`${name}.txt`)
  if (!entry) {
    if (required) throw new Error(`${name}.txt not found in gtfs.zip`)
    return undefined
  }
  return parseCsv(entry.toString('utf-8')) as unknown as T
}

function buildShapesGeoJson(rows: Record<string, string>[]): BucrShapesGeoJson {
  const byShape = new Map<string, Record<string, string>[]>()
  for (const row of rows) {
    const shapeId = row.shape_id!
    const list = byShape.get(shapeId)
    if (list) list.push(row)
    else byShape.set(shapeId, [row])
  }

  const features: BucrShapeFeature[] = []
  for (const [shapeId, points] of byShape) {
    points.sort((a, b) => Number(a.shape_pt_sequence) - Number(b.shape_pt_sequence))
    const coordinates: [number, number][] = points.map(p => [Number(p.shape_pt_lon), Number(p.shape_pt_lat)])
    const lastPoint = points[points.length - 1]!
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates },
      properties: {
        shape_id: shapeId,
        shape_dist_traveled: lastPoint.shape_dist_traveled ? Number(lastPoint.shape_dist_traveled) : null
      }
    })
  }
  return { type: 'FeatureCollection', features }
}

function buildStopsGeoJson(rows: Record<string, string>[]): BucrStopsGeoJson {
  const features: BucrStopFeature[] = rows.map((row) => {
    const { stop_lat, stop_lon, ...properties } = row
    delete properties.stop_point
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [Number(stop_lon), Number(stop_lat)] },
      properties: properties as unknown as BucrStopFeature['properties']
    }
  })
  return { type: 'FeatureCollection', features }
}

function parseGtfsZip(buffer: Buffer): BucrGtfsData {
  const entries = unzip(buffer)
  return {
    routes: readTable<BucrRoute[]>(entries, 'routes', true),
    trips: readTable<BucrTrip[]>(entries, 'trips', true),
    stopTimes: readTable<BucrStopTime[]>(entries, 'stop_times', true),
    // fare_attributes.txt is optional per the GTFS spec, and bUCR's real
    // feed doesn't currently publish one (unlike the stale bucr/api/*.json
    // this replaces, which had a leftover free-fare row) — see the caller.
    fareAttributes: readTable<BucrFareAttribute[]>(entries, 'fare_attributes', false) ?? [],
    shapesGeoJson: buildShapesGeoJson(readTable<Record<string, string>[]>(entries, 'shapes', true)),
    stopsGeoJson: buildStopsGeoJson(readTable<Record<string, string>[]>(entries, 'stops', true))
  }
}

async function loadBundledFallback(): Promise<BucrGtfsData> {
  const storage = useStorage('assets:server')
  const read = async <T>(name: string): Promise<T> => {
    const raw = await storage.getItem(`gtfs:${name}`)
    if (raw == null) throw new Error(`Missing bundled fallback for ${name}`)
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T
  }
  const [routes, stopsGeoJson, trips, stopTimes, shapesGeoJson, fareAttributes] = await Promise.all([
    read<BucrRoute[]>('routes.json'),
    read<BucrStopsGeoJson>('stops.geojson'),
    read<BucrTrip[]>('trips.json'),
    read<BucrStopTime[]>('stop_times.json'),
    read<BucrShapesGeoJson>('shapes.geojson'),
    read<BucrFareAttribute[]>('fare_attributes.json')
  ])
  return { routes, stopsGeoJson, trips, stopTimes, shapesGeoJson, fareAttributes }
}

async function doSync(): Promise<BucrGtfsData> {
  const url = useRuntimeConfig().gtfsZipUrl
  try {
    const arrayBuffer = await $fetch<ArrayBuffer>(url, { responseType: 'arrayBuffer' })
    const buffer = Buffer.from(arrayBuffer)

    const hash = createHash('sha256').update(buffer).digest('hex')
    if (hash === cachedHash && cachedData) return cachedData

    const data = parseGtfsZip(buffer)
    cachedHash = hash
    cachedData = data
    console.log(`[gtfsZip] synced ${url} (sha256 ${hash.slice(0, 12)}…)`)
    return data
  } catch (error) {
    // Covers both a failed download and a downloaded-but-malformed/incomplete
    // zip (missing a required .txt, corrupt bytes) — either way, don't crash
    // requests over a bad upstream feed.
    const message = error instanceof Error ? error.message : String(error)
    if (cachedData) {
      console.warn(`[gtfsZip] sync of ${url} failed, serving last known data: ${message}`)
      return cachedData
    }
    console.warn(`[gtfsZip] sync of ${url} failed on first load, using bundled fallback: ${message}`)
    return loadBundledFallback()
  }
}

/** Hash-gated download+parse of bUCR's gtfs.zip; dedupes concurrent calls. */
export async function syncGtfsZip(): Promise<BucrGtfsData> {
  if (inFlight) return inFlight
  inFlight = doSync()
  try {
    return await inFlight
  } finally {
    inFlight = null
  }
}

export async function loadBucrGtfs(): Promise<BucrGtfsData> {
  return syncGtfsZip()
}
