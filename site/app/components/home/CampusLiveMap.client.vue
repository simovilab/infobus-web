<script setup lang="ts">
import type { GtfsRoute } from '~/types/gtfs'
import type { StyleSpecification } from 'maplibre-gl'
import { Map as MaplibreMap, Marker, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { CAMPUS_MAP_CENTER, CAMPUS_MAP_ZOOM } from '~/utils/campusMapReference'

// maplibre-gl resolves its tile-processing worker relative to its own
// import.meta.url at runtime, which Vite's production bundler can't see
// (it's built from a string template, not a static `new URL(...)`), so the
// worker chunk silently never gets emitted into the build — the map then
// hangs forever on the loading spinner since no vector tiles ever get
// decoded. `?worker&url` routes it through Vite's worker pipeline instead
// (bundles it as its own self-contained chunk, worker deps included), and
// setWorkerUrl points maplibre-gl at that instead of guessing.
setWorkerUrl(workerUrl)

// Real basemap (OpenFreeMap "positron" — free, keyless, light gray) instead
// of a hand-illustrated SVG, so the actual shape of the UCR Rodrigo Facio
// campus is visible. Route lines/stops are drawn from each stop's real
// lat/lon (server/utils/scheduleProvider.ts) as GeoJSON layers on top. This
// is a static schedule map (bucr's GTFS Schedule feed, no GTFS-RT source
// yet) — it intentionally does NOT show moving bus markers, which would
// misrepresent it as a live vehicle tracker.
//
// The style/sprite/glyphs/tiles are a self-hosted copy under public/tiles/
// (see scripts/fetch-basemap-tiles.mjs) instead of tiles.openfreemap.org
// live — OpenFreeMap serves the full OpenMapTiles vector dataset regardless
// of style, and a single live tile near UCR measured ~370 KB; the campus
// area only needs a small, fixed set of tiles, so caching them ourselves
// cuts a multi-MB live fetch down to a couple hundred KB, same-origin, no
// dependency on a third-party host's latency from wherever a visitor is.
// Re-run that script if the route's area or the zoom levels needed change.
//
// The caller (index.vue) scopes routes[] to one origin+direction sentido
// already, so this is at most two patterns: the regular one and its
// evening milla universitaria detour (GtfsRoute.is_milla) — never
// something needing a legend/click-to-select UI to disambiguate. The milla
// variant always draws dashed alongside the regular one, solid; where they
// geographically coincide (the shared trunk) the solid stroke covers the
// dashed one, so only the genuinely diverging branch reads as dashed.
const props = defineProps<{
  routes: GtfsRoute[]
  compact?: boolean
  /** Center tightly on this point and mark it "Estás acá" — used for the stop detail page's mini map. */
  focus?: { lat: number, lon: number }
}>()

// Lets a parent (e.g. MapPlaceholder's crossfade in index.vue) know when
// it's safe to fade this in and fade the placeholder out.
const emit = defineEmits<{ loaded: [] }>()

const mapContainer = useTemplateRef<HTMLDivElement>('mapContainer')
let map: MaplibreMap | null = null

// The map still needs a handful of round-trips (style, sprite, glyphs,
// tiles — same-origin, see the note above) before anything is visible, so
// it's slower than the old self-contained SVG illustration — show a
// placeholder instead of a blank box while that's in flight.
const isLoaded = ref(false)

type LngLatTuple = [number, number]

/** The real street-following path (GTFS shapes.txt) if the route has one, else a straight stop-to-stop fallback. */
function routeLine(route: GtfsRoute): LngLatTuple[] {
  return route.shape?.length ? route.shape : route.stops.map((s): LngLatTuple => [s.lon, s.lat])
}

function routeGeoJson() {
  const list = props.routes.filter(route => route.stops.length > 1)
  return {
    type: 'FeatureCollection' as const,
    features: list.map((route, i) => ({
      type: 'Feature' as const,
      properties: {
        routeId: route.route_id,
        color: `#${route.route_color}`,
        milla: !!route.is_milla,
        // Routes that share the same physical street (e.g. both directions
        // of the bUCR loop) would otherwise draw exactly on top of each
        // other and be indistinguishable — nudge each route a few pixels
        // sideways so overlapping stretches render as parallel lines.
        // list.length <= 1 keeps a single route perfectly centered.
        offset: list.length > 1 ? (i - (list.length - 1) / 2) * 3.2 : 0
      },
      geometry: { type: 'LineString' as const, coordinates: routeLine(route) }
    }))
  }
}

type PointFeature = {
  type: 'Feature'
  properties: { name: string, terminal: boolean }
  geometry: { type: 'Point', coordinates: LngLatTuple }
}

function stopsGeoJson() {
  const byId = new Map<string, PointFeature>()
  for (const route of props.routes) {
    for (const stop of route.stops) {
      if (byId.has(stop.id)) continue
      byId.set(stop.id, {
        type: 'Feature',
        properties: { name: stop.name, terminal: !!stop.terminal },
        geometry: { type: 'Point', coordinates: [stop.lon, stop.lat] }
      })
    }
  }
  return { type: 'FeatureCollection' as const, features: [...byId.values()] }
}

onMounted(async () => {
  // Kicked off before awaiting nextTick (rather than after) so the request
  // starts in this same tick — index.vue also fires a <link rel=preload>
  // for this same URL as soon as the section nears the viewport, so by the
  // time this resolves it's usually a cache hit instead of a cold fetch.
  const stylePromise = $fetch<StyleSpecification>('/tiles/style.json')

  await nextTick()
  if (!mapContainer.value) return

  // MapLibre requires `sprite` to be a fully-qualified URL (root-relative
  // paths throw "must be absolute"), but the static style.json can't bake
  // in a real origin — fetch it ourselves and resolve sprite against the
  // page's own origin before handing it a style object instead of a URL.
  const style = await stylePromise
  style.sprite = new URL('/tiles/sprite', location.origin).href

  map = new MaplibreMap({
    container: mapContainer.value,
    style,
    // Fixed, not fitBounds-to-content: this needs to be pixel-identical to
    // what MapPlaceholder projects its SVG route against (see
    // campusMapReference.ts) — a dynamically-computed fitBounds result
    // can't be matched by a build-time-generated placeholder, since it
    // depends on the live container size. focus mode (the stop detail
    // page's mini map) is the one case that still centers dynamically,
    // since it has no placeholder to stay aligned with.
    center: props.focus ? [props.focus.lon, props.focus.lat] : CAMPUS_MAP_CENTER,
    zoom: props.focus ? 16.8 : CAMPUS_MAP_ZOOM,
    interactive: false,
    attributionControl: { compact: true },
    // This is a static illustration, not a basemap someone zooms into for
    // detail — @2x/@3x retina tiles cost 4-9x the bytes for sharpness we
    // don't need here, so force standard-resolution tiles.
    pixelRatio: 1,
    fadeDuration: 0
  })

  map.on('load', () => {
    if (!map) return

    map.addSource('bucr-routes', { type: 'geojson', data: routeGeoJson() })

    const regularWidth = props.compact ? 5 : 4
    const millaWidth = props.compact ? 3.5 : 3

    // line-dasharray isn't a data-driven (per-feature) paint property in
    // MapLibre's style spec, so "solid for the regular pattern, dashed for
    // its milla variant" needs two layers filtered by the `milla` feature
    // flag, rather than one layer with an expression. Dashed is added first
    // so the solid layer draws on top of it wherever their paths coincide.
    map.addLayer({
      id: 'bucr-routes-line-dashed',
      type: 'line',
      source: 'bucr-routes',
      filter: ['==', ['get', 'milla'], true],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': millaWidth,
        'line-opacity': 0.55,
        'line-offset': ['get', 'offset'],
        'line-dasharray': [2, 1.6]
      }
    })
    map.addLayer({
      id: 'bucr-routes-line-solid',
      type: 'line',
      source: 'bucr-routes',
      filter: ['==', ['get', 'milla'], false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': regularWidth,
        'line-opacity': 0.92,
        'line-offset': ['get', 'offset']
      }
    })

    map.addSource('bucr-stops', { type: 'geojson', data: stopsGeoJson() })
    map.addLayer({
      id: 'bucr-stops-dot',
      type: 'circle',
      source: 'bucr-stops',
      paint: {
        'circle-radius': ['case', ['get', 'terminal'], 6.5, 4.5],
        'circle-color': '#fff',
        'circle-stroke-color': '#0E1116',
        'circle-stroke-width': 2.5
      }
    })

    if (!props.compact && !props.focus) {
      map.addLayer({
        id: 'bucr-stops-label',
        type: 'symbol',
        source: 'bucr-stops',
        layout: {
          'text-field': ['get', 'name'],
          // Explicit, not the MapLibre style-spec default ("Open Sans
          // Regular, Arial Unicode MS Regular") — OpenFreeMap's glyph
          // server only actually serves the Noto Sans family, so the
          // default 404s per glyph range instead of silently falling back.
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
          'text-optional': true
        },
        paint: {
          'text-color': '#0E1116',
          'text-halo-color': '#fff',
          'text-halo-width': 1.4
        }
      })
    }

    if (props.focus) {
      const el = document.createElement('div')
      el.className = 'campus-map-focus-pin'
      el.innerHTML = '<span></span>'
      new Marker({ element: el }).setLngLat([props.focus.lon, props.focus.lat]).addTo(map)
    }

    isLoaded.value = true
    emit('loaded')
  })
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div
    class="relative w-full"
    :class="focus ? 'h-[220px]' : 'h-full min-h-[320px]'"
  >
    <div
      ref="mapContainer"
      class="h-full w-full bg-surface-3"
    />
    <div
      v-if="!isLoaded"
      class="absolute inset-0 flex items-center justify-center bg-surface-3"
    >
      <span class="map-spinner" />
    </div>
  </div>
</template>

<style>
.campus-map-focus-pin span {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #0E1116;
  border: 3px solid #fff;
  box-shadow: 0 0 0 8px rgba(255, 193, 7, .3), 0 1px 4px rgba(14, 17, 22, .4);
}
.maplibregl-ctrl-attrib {
  font-size: 10px;
}
</style>
