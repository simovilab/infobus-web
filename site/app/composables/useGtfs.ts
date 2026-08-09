import type {
  BucrAgency,
  BucrCalendar,
  BucrCalendarDate,
  BucrFareAttribute,
  BucrFareRule,
  BucrFeedInfo,
  BucrIndex,
  BucrRoute,
  BucrShape,
  BucrStop,
  BucrStopTime,
  BucrTranslation,
  BucrTrip
} from '~/types/bucr-gtfs'

/**
 * Consumes the static GTFS API published by bucr (files/*.txt -> api/*.json,
 * see bucr/build.py) directly by URL — bucr is the single source of truth,
 * this site doesn't duplicate the feed data.
 *
 * Caches each file in a useState (one load per client session) and, if the
 * fetch against the configured URL fails (GitHub rate-limit, no network),
 * retries against the local fallback copy in public/api/.
 */
function useGtfsFile<T>(name: string) {
  const config = useRuntimeConfig()
  const cache = useState<T | null>(`bucr-gtfs-${name}`, () => null)
  const error = useState<string | null>(`bucr-gtfs-${name}-error`, () => null)

  async function load(): Promise<T> {
    if (cache.value) return cache.value

    const base = config.public.gtfsApiBase
    const fallbackBase = '/api/'

    try {
      cache.value = (await $fetch(`${base}${name}.json`)) as T
      error.value = null
      return cache.value
    } catch (remoteError) {
      if (base === fallbackBase) throw remoteError
      try {
        cache.value = (await $fetch(`${fallbackBase}${name}.json`)) as T
        error.value = null
        return cache.value
      } catch (fallbackError) {
        error.value = `Could not load ${name}.json (remote or local)`
        throw fallbackError
      }
    }
  }

  return { load, error }
}

export function useGtfs() {
  return {
    getAgency: () => useGtfsFile<BucrAgency[]>('agency').load(),
    getStops: () => useGtfsFile<BucrStop[]>('stops').load(),
    getRoutes: () => useGtfsFile<BucrRoute[]>('routes').load(),
    getTrips: () => useGtfsFile<BucrTrip[]>('trips').load(),
    getStopTimes: () => useGtfsFile<BucrStopTime[]>('stop_times').load(),
    getCalendar: () => useGtfsFile<BucrCalendar[]>('calendar').load(),
    getCalendarDates: () => useGtfsFile<BucrCalendarDate[]>('calendar_dates').load(),
    getFareAttributes: () => useGtfsFile<BucrFareAttribute[]>('fare_attributes').load(),
    getFareRules: () => useGtfsFile<BucrFareRule[]>('fare_rules').load(),
    getShapes: () => useGtfsFile<BucrShape[]>('shapes').load(),
    getFeedInfo: () => useGtfsFile<BucrFeedInfo[]>('feed_info').load(),
    getTranslations: () => useGtfsFile<BucrTranslation[]>('translations').load(),
    getIndex: () => useGtfsFile<BucrIndex>('index').load()
  }
}
