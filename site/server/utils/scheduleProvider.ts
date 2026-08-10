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
 * supplies the stop order and per-stop scheduled_time; first/last bus and
 * frequency are computed across every trip that shares the pattern.
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
    const direction_id = shapeId.startsWith('desde_odontologia') ? 1 as const : 0 as const

    const departureTimes = sortedTrips.map(t => t.trip_departure_time!)
    const firstDeparture = first(departureTimes, `departure for shape ${shapeId}`)
    const lastDeparture = departureTimes[departureTimes.length - 1]!
    const frequency_minutes = averageFrequencyMinutes(departureTimes)
    const shapeFeature = shapeById.get(shapeId)
    const distance_km = shapeFeature?.properties.shape_dist_traveled ?? undefined

    routes.push({
      route_id: `${bucrRoute.route_id}__${shapeId}`,
      // The badge label distinguishing each pattern: the "other" terminus
      // from Odontología/Deportivas — the real route_short_name ("bUCR")
      // is the same for all 7 patterns and wouldn't tell them apart.
      route_short_name: direction_id === 0 ? firstStop.name : lastStop.name,
      // sin_milla and con_milla patterns share the same first/last stop
      // (e.g. both are "Educación → Odontología"), so the milla variant
      // needs its own qualifier here — without it, two legend entries with
      // the same text but different line colors are indistinguishable. The
      // time window comes from this pattern's own real departures, not a
      // hardcoded "19:00", so it stays correct if the schedule ever shifts.
      route_long_name: `${firstStop.name} → ${lastStop.name}${isMilla ? ` (vía milla, desde ${hhmm(firstDeparture)})` : ''}`,
      route_desc: `Servicio de ${firstStop.name} a ${lastStop.name}${isMilla ? `, vía la milla universitaria (de ${hhmm(firstDeparture)} a ${hhmm(lastDeparture)})` : ''}.`,
      route_type: Number(bucrRoute.route_type),
      route_color: bucrRoute.route_color ?? '005DA4',
      direction_id,
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
