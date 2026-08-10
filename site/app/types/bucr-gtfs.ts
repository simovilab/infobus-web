/**
 * "Raw" GTFS shapes as published by bucr/api/*.json — one array of objects
 * per GTFS file, using the spec's standard field names. Distinct from
 * ~/types/gtfs.ts (GtfsRoute/GtfsStop), which is the enriched model used by
 * the coming-soon UI (see useSchedule/scheduleProvider).
 *
 * Shapes and stops specifically are consumed as GeoJSON
 * (api/shapes.geojson, api/stops.geojson) instead of the raw per-row
 * shapes.json/stops.json — bucr/build.py builds the LineString/Point
 * geometry once, following the same convention incofer
 * (utils/create_geo_shapes.py/create_geo_stops.py) and databus/infobus
 * (GeoDjango + django-rest-framework-gis) use. Nothing in this app should
 * re-derive geometry from raw lat/lon rows itself.
 */

export interface BucrAgency {
  agency_id: string
  agency_name: string
  agency_url: string
  agency_timezone: string
  agency_lang?: string
  agency_phone?: string
  agency_fare_url?: string
  agency_email?: string
}

export interface BucrRoute {
  route_id: string
  agency_id: string
  route_short_name: string
  route_long_name: string
  route_desc?: string
  route_type: string
  route_url?: string
  route_color?: string
  route_text_color?: string
}

export interface BucrTrip {
  route_id: string
  service_id: string
  trip_id: string
  trip_departure_time?: string
  trip_headsign?: string
  trip_short_name?: string
  direction_id?: string
  shape_id?: string
  wheelchair_accessible?: string
  bikes_allowed?: string
}

export interface BucrStopTime {
  trip_id: string
  arrival_time: string
  departure_time: string
  stop_id: string
  stop_sequence: string
  timepoint?: string
  shape_dist_traveled?: string
  stop_headsign?: string
}

export interface BucrCalendar {
  service_id: string
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
  start_date: string
  end_date: string
}

export interface BucrCalendarDate {
  service_id: string
  date: string
  exception_type: string
  holiday_name?: string
}

export interface BucrFeedInfo {
  feed_publisher_name: string
  feed_publisher_url: string
  feed_lang: string
  feed_start_date?: string
  feed_end_date?: string
  feed_version?: string
  feed_contact_email?: string
}

export interface BucrFareAttribute {
  fare_id: string
  price: string
  currency_type: string
  payment_method: string
  transfers?: string
  agency_id?: string
  transfer_duration?: string
}

export interface BucrFareRule {
  fare_id: string
  route_id?: string
  origin_id?: string
  destination_id?: string
}

export interface BucrTranslation {
  table_name: string
  field_name: string
  language: string
  translation: string
  record_id?: string
  record_sub_id?: string
  field_value?: string
}

export interface BucrIndex {
  files: Record<string, number>
  generated_at: string
}

export interface BucrShapeFeature {
  type: 'Feature'
  geometry: { type: 'LineString', coordinates: [number, number][] }
  properties: { shape_id: string, shape_dist_traveled: number | null }
}

export interface BucrShapesGeoJson {
  type: 'FeatureCollection'
  features: BucrShapeFeature[]
}

export interface BucrStopFeature {
  type: 'Feature'
  geometry: { type: 'Point', coordinates: [number, number] }
  properties: {
    stop_id: string
    stop_name: string
    stop_code?: string
    stop_desc?: string
    stop_heading?: string
    zone_id?: string
    stop_url?: string
    location_type?: string
    parent_station?: string
    wheelchair_boarding?: string
    shelter?: string
    bench?: string
    lit?: string
    bay?: string
    device_charging_station?: string
  }
}

export interface BucrStopsGeoJson {
  type: 'FeatureCollection'
  features: BucrStopFeature[]
}
