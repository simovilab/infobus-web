/**
 * Fixed center/zoom for bUCR's campus map — used identically by both
 * CampusLiveMap (the live MapLibre view) and MapPlaceholder (the static
 * SVG-over-image preview shown while it loads), so the two are
 * pixel-aligned by construction instead of one trying to sync to the
 * other's dynamically-computed fitBounds result at runtime.
 *
 * This is the same approach a Mapbox/Google Static Maps API placeholder
 * uses: request the static image and initialize the live map with the
 * *identical* center/zoom, rather than letting either one auto-fit to
 * content — auto-fitting is what made the two impossible to keep in sync,
 * since fitBounds recomputes independently from live container size.
 *
 * Zoom is chosen to comfortably show the whole route without cropping at
 * the narrowest supported container width (~390px, the mobile breakpoint)
 * — see the sizing note in MapPlaceholder.vue. Re-run
 * scripts/fetch-basemap-tiles.mjs's screenshot step (map-placeholder.webp)
 * if either value changes.
 */
export const CAMPUS_MAP_CENTER: [number, number] = [-84.047182, 9.941015]
export const CAMPUS_MAP_ZOOM = 14.5
