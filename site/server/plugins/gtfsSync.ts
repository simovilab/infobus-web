import { syncGtfsZip } from '../utils/bucrGtfs'

const HOUR_MS = 60 * 60 * 1000

/**
 * Polls bUCR's gtfs.zip hourly (syncGtfsZip is hash-gated, so an unchanged
 * feed is a no-op besides the download). Requests never trigger this
 * themselves beyond an on-demand fetch if the cache is still cold — this
 * plugin just makes sure it's warm and stays fresh without waiting on
 * traffic.
 */
export default defineNitroPlugin(() => {
  const sync = () => syncGtfsZip().catch((error: unknown) => {
    console.error('[gtfsZip] scheduled sync failed:', error)
  })

  sync()
  const interval = setInterval(sync, HOUR_MS)
  interval.unref()
})
