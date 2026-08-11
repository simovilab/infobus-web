export interface GtfsStop {
  id: string
  name: string
  lat: number
  lon: number
  // GTFS wheelchair_boarding: 0 = no info, 1 = accessible, 2 = not accessible.
  wheelchair_boarding?: 0 | 1 | 2
  /** route_ids this stop is a transfer point for, besides the route it's listed under. */
  transfer_routes?: string[]
  terminal?: boolean
  /** Scheduled time at this stop, for this particular route's trip (HH:MM). GTFS stop_times.txt equivalent. */
  scheduled_time?: string
  /** Live/predicted time — differs from scheduled_time when the route is running behind. */
  live_time?: string
  display_coords?: string
  platform_features?: string[]
  /** GTFS-RT-style service_alert scoped to this stop, plain text. */
  alert?: string
  /** Campus/zone label (e.g. "Finca 1") — optional, not every transit system has sub-zones. */
  zone?: string
  /** Plain-language landmark description shown on the paradas list (e.g. "Frente al jardín de la Facultad de Educación"). */
  description?: string
}

export interface GtfsRoute {
  route_id: string
  route_short_name: string
  route_long_name: string
  route_desc: string
  route_type: number
  route_color: string
  /** GTFS direction_id: 0 = hacia Deportivas (Finca 1 → Finca 3), 1 = desde Deportivas (Finca 3 → Finca 1). */
  direction_id: 0 | 1
  direction_destinations?: string[]
  /** True for the evening "milla universitaria" detour variant of a pattern — drawn dashed alongside the regular route rather than picked via selection. */
  is_milla?: boolean
  /** Every real departure time (HH:MM) this pattern makes — what a Horarios table should list, not stops[].scheduled_time (that's one representative trip's stop-by-stop path, for the map/tramo, not a timetable). */
  departures?: string[]
  /** Short "via" description shown under the route name (e.g. "EDUFI · CIMAR · Lanamme"). */
  tramo?: string
  frequency_minutes?: number
  /** Plain-language current service status ("Servicio normal", "Demoras de 3 min"). */
  status?: string
  status_level?: 'ok' | 'warn' | 'danger'
  distance_km?: number
  service_hours?: string
  first_bus?: string
  last_bus?: string
  peak_frequency_minutes?: number
  offpeak_frequency_minutes?: number
  fare?: string
  fare_note?: string
  /** GTFS-RT-style service_alert scoped to this route, plain text. */
  alert?: string
  /**
   * Street-following path as [lon, lat] pairs — GTFS shapes.txt equivalent.
   * Not used by this page (no map here) but kept on the shape so the
   * fixture stays a drop-in match for the real GTFS-shaped data later.
   */
  shape?: [number, number][]
  stops: GtfsStop[]
}
