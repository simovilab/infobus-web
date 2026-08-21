import type { GtfsRoute, GtfsStop } from '../../app/types/gtfs'
import type { BucrStopFeature, BucrStopTime, BucrTrip } from '../../app/types/bucr-gtfs'
import { loadBucrGtfs } from './bucrGtfs'

/**
 * Builds the schedule shown on the site from bucr's real static GTFS feed
 * (see bucrGtfs.ts) — the single source of truth for bUCR's schedule,
 * published by the sibling `bucr` repo.
 *
 * bUCR is currently modeled in GTFS as one route (bUCR_L1) with 7 distinct
 * trip patterns (shape_id): 4 outbound (from Educación/Artes Plásticas,
 * with/without the evening milla universitaria detour) and 3 return trips
 * (to Educación/Artes Plásticas/EDUFI). Each pattern becomes one GtfsRoute
 * entry here — this app models a "route" as a distinct stop pattern rather
 * than a literal GTFS route_id, same shape scheduleMock.ts used to fill in
 * by hand. One representative trip per pattern (the earliest departure)
 * supplies the stop order and per-stop scheduled_time, used for the map and
 * `tramo` — not for Horarios, which needs every real departure a rider
 * could catch, not one trip's path (see `departures`, computed from every
 * trip sharing the pattern, same set first/last bus and frequency come from).
 */

function hhmm(time: string) {
  return time.slice(0, 5)
}

function toMinutes(time: string) {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
}

function first<T>(items: T[], what: string): T {
  const item = items[0]
  if (item === undefined) throw new Error(`Expected at least one ${what}`)
  return item
}

function averageFrequencyMinutes(departureTimes: string[]): number | undefined {
  if (departureTimes.length < 2) return undefined
  const minutes = [...departureTimes].map(toMinutes).sort((a, b) => a - b)
  const gaps = minutes.slice(1).map((m, i) => m - minutes[i]!)
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const list = map.get(k)
    if (list) list.push(item)
    else map.set(k, [item])
  }
  return map
}

export async function fetchScheduleRoutes(): Promise<GtfsRoute[]> {
  const { routes: bucrRoutes, stopsGeoJson, trips, stopTimes, shapesGeoJson, fareAttributes } = await loadBucrGtfs()

  const bucrRoute = first(bucrRoutes, 'route in bucr feed')
  const fare = fareAttributes[0]
  const stopById = new Map(stopsGeoJson.features.map(f => [f.properties.stop_id, f]))
  const shapeById = new Map(shapesGeoJson.features.map(f => [f.properties.shape_id, f]))
  const stopTimesByTrip = groupBy(stopTimes, st => st.trip_id)
  const tripsByShape = groupBy(
    trips.filter((t): t is BucrTrip & { shape_id: string } => !!t.shape_id),
    t => t.shape_id
  )

  const routes: GtfsRoute[] = []

  for (const [shapeId, shapeTrips] of tripsByShape) {
    const sortedTrips = [...shapeTrips].sort(
      (a, b) => toMinutes(a.trip_departure_time!) - toMinutes(b.trip_departure_time!)
    )
    const representativeTrip = first(sortedTrips, `trip for shape ${shapeId}`)
    const tripStopTimes = (stopTimesByTrip.get(representativeTrip.trip_id) ?? [])
      .sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence))
    if (tripStopTimes.length === 0) continue

    const stops = buildStops(tripStopTimes, stopById)
    const firstStop = first(stops, `stop for shape ${shapeId}`)
    const lastStop = stops[stops.length - 1]!
    const isMilla = shapeId.includes('con_milla')
    // Read straight from the trip's own GTFS direction_id — a prior version
    // guessed it from shapeId.startsWith('desde_odontologia'), which
    // silently mis-sorted the 21:20 short-turn (desde_edufi_a_educacion)
    // into the wrong sentido once bucr renamed that shape (it starts at
    // EDUFI, not Odontología, even though direction_id correctly says 1).
    const direction_id = representativeTrip.direction_id === '1' ? 1 as const : 0 as const

    const departureTimes = sortedTrips.map(t => t.trip_departure_time!)
    const firstDeparture = first(departureTimes, `departure for shape ${shapeId}`)
    const lastDeparture = departureTimes[departureTimes.length - 1]!
    const frequency_minutes = averageFrequencyMinutes(departureTimes)
    const shapeFeature = shapeById.get(shapeId)
    const distance_km = shapeFeature?.properties.shape_dist_traveled ?? undefined

    routes.push({
      route_id: `${bucrRoute.route_id}__${shapeId}`,
      // The real GTFS route_short_name — bUCR is a single route, so this is
      // "bUCR" for all 7 patterns. It used to be repurposed to hold the
      // pattern's "other" terminus instead (Educación/Artes/Odontología) so
      // the old single Hacia/Desde Deportivas tab could tell patterns apart
      // by badge alone, but now that Horarios/Paradas/Mapas all group by
      // origin first (see index.vue's grupoIdFor), every row already shares
      // one sentido — the badge no longer needs to encode which pattern.
      route_short_name: bucrRoute.route_short_name,
      // The time window comes from this pattern's own real departures, not
      // a hardcoded "19:00", so it stays correct if the schedule ever shifts.
      route_long_name: `${firstStop.name} → ${lastStop.name}${isMilla ? ` (con milla, desde ${hhmm(firstDeparture)})` : ''}`,
      route_desc: `Servicio de ${firstStop.name} a ${lastStop.name}${isMilla ? `, con la milla universitaria (de ${hhmm(firstDeparture)} a ${hhmm(lastDeparture)})` : ''}.`,
      route_type: Number(bucrRoute.route_type),
      route_color: bucrRoute.route_color ?? '005DA4',
      direction_id,
      is_milla: isMilla,
      // Every departure this pattern actually makes (Horarios shows these
      // directly — a rider needs to know when the bus leaves Educación,
      // not the one representative trip's full stop-by-stop path).
      departures: departureTimes.map(hhmm),
      tramo: stops.length > 2 ? stops.slice(1, -1).map(s => s.name).join(' · ') : undefined,
      frequency_minutes,
      status: isMilla ? 'Servicio nocturno' : 'Servicio normal',
      status_level: 'ok',
      direction_destinations: [firstStop.name, lastStop.name],
      distance_km,
      service_hours: `Lunes a viernes ${hhmm(firstDeparture)} – ${hhmm(lastDeparture)}`,
      first_bus: hhmm(firstDeparture),
      last_bus: hhmm(lastDeparture),
      peak_frequency_minutes: frequency_minutes,
      offpeak_frequency_minutes: frequency_minutes,
      fare: fare && Number(fare.price) === 0 ? 'Gratuito' : undefined,
      fare_note: 'Para toda la comunidad universitaria',
      shape: shapeFeature?.geometry.coordinates,
      stops
    })
  }

  // A stop shared by more than one pattern must list the *other* patterns
  // as transfer_routes — derived per route-stop-entry (not on the shared
  // stop record) since each route clones its own stop objects.
  for (const route of routes) {
    for (const stop of route.stops) {
      const others = routes.filter(r => r.route_id !== route.route_id && r.stops.some(s => s.id === stop.id))
      stop.transfer_routes = others.length ? others.map(r => r.route_id) : undefined
    }
  }

  return routes
}

function buildStops(tripStopTimes: BucrStopTime[], stopById: Map<string, BucrStopFeature>): GtfsStop[] {
  return tripStopTimes.map((st, i): GtfsStop => {
    const bucrStop = stopById.get(st.stop_id)
    if (!bucrStop) throw new Error(`Unknown stop_id ${st.stop_id} in bucr feed`)
    const [lon, lat] = bucrStop.geometry.coordinates
    const wheelchair = Number(bucrStop.properties.wheelchair_boarding ?? 0)
    return {
      id: st.stop_id,
      name: bucrStop.properties.stop_name,
      lat,
      lon,
      wheelchair_boarding: (wheelchair === 1 || wheelchair === 2 ? wheelchair : 0) as 0 | 1 | 2,
      terminal: i === 0 || i === tripStopTimes.length - 1,
      scheduled_time: hhmm(st.arrival_time),
      description: bucrStop.properties.stop_desc || undefined
    }
  })
}
