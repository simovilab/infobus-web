import type { GtfsRoute } from '~/types/gtfs'

/**
 * Polls the schedule endpoint on an interval, same pattern as the live
 * data composables (useVehicles/useEta) on feat/bucr-static-site: useFetch
 * + client-only setInterval + onScopeDispose. A schedule doesn't change
 * intra-session, but polling here keeps the frontend architecture
 * identical to what it'll be once /api/routes is backed by a real GTFS
 * source (see server/utils/scheduleProvider.ts) — swapping the source
 * later needs no change here.
 */
export function useSchedule() {
  const result = useFetch<GtfsRoute[]>('/api/routes', { key: 'bucr-schedule' })

  if (import.meta.client) {
    const interval = setInterval(() => result.refresh(), 60_000)
    onScopeDispose(() => clearInterval(interval))
  }

  return result
}
