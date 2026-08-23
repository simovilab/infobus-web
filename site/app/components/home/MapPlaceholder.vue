<script setup lang="ts">
import type { GtfsRoute } from '~/types/gtfs'
import mapPlaceholder from '~/assets/images/map-placeholder.webp'
import { CAMPUS_MAP_CENTER, CAMPUS_MAP_ZOOM } from '~/utils/campusMapReference'
import { buildRouteSegments } from '~/utils/routeGeometry'

/**
 * Instant-paint stand-in for CampusLiveMap while the real MapLibre map
 * loads (style/sprite/glyphs/tiles — see that component's notes). Unlike a
 * plain spinner, this shows the actual route/stops immediately: the
 * background is a static screenshot of just the basemap (no route baked
 * in — the basemap is stable, but a baked-in route would go stale the
 * moment the schedule changes), and the route line/stop dots are drawn
 * fresh on top as SVG from the same data CampusLiveMap uses (routeGeometry.ts's
 * buildRouteSegments does the milla-dashing/overlap-dedup work identically
 * for both, so this placeholder doesn't drift from what the real map
 * ends up drawing), projected
 * with the same Web Mercator math MapLibre itself uses internally, at the
 * exact same fixed center/zoom CampusLiveMap initializes with (see
 * campusMapReference.ts — that's what keeps the two pixel-aligned; an
 * independently-computed fitBounds result on either side can't be
 * reliably matched). No network request beyond the one static image — the
 * route/stop data is already loaded (it's the schedule, not map tiles).
 *
 * This component has no browser-only dependencies (no WebGL, no
 * maplibre-gl), so — unlike CampusLiveMap.client.vue — it renders during
 * SSR and shows up in the very first HTML response, before any JS runs.
 */
const props = defineProps<{
  routes: GtfsRoute[]
}>()

// The screenshot's capture size (1088x560 — the Mapas section's bounded
// max-width, see mapaSectionUi in index.vue, at the sm:h-[560px] breakpoint
// height). The actual rendered box is measured below and can be a
// different aspect ratio entirely (e.g. the h-[420px] mobile breakpoint,
// much narrower/taller than this) — the SVG viewBox is computed to crop
// exactly like the <img>'s object-fit:cover does from this reference,
// rather than approximating it with preserveAspectRatio="slice", which
// isn't guaranteed to crop identically to CSS object-fit at every
// intermediate size. Re-screenshot at these dimensions if the max-width or
// breakpoint height changes.
const REF_WIDTH = 1088
const REF_HEIGHT = 560

const root = useTemplateRef<HTMLDivElement>('root')
const { width: boxWidth, height: boxHeight } = useElementSize(root)

// Same "cover" math as CSS object-fit:cover: scale up until both
// dimensions are at least filled, then only the visible window (the part
// that isn't cropped off) needs representing in the SVG's viewBox.
const viewBox = computed(() => {
  const w = boxWidth.value || REF_WIDTH
  const h = boxHeight.value || REF_HEIGHT
  const scale = Math.max(w / REF_WIDTH, h / REF_HEIGHT)
  const visibleWidth = w / scale
  const visibleHeight = h / scale
  return `${-visibleWidth / 2} ${-visibleHeight / 2} ${visibleWidth} ${visibleHeight}`
})

function mercatorPx(lon: number, lat: number): [number, number] {
  const scale = 256 * 2 ** CAMPUS_MAP_ZOOM
  const x = scale * (lon + 180) / 360
  const sinLat = Math.sin((lat * Math.PI) / 180)
  const y = scale * (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI))
  return [x, y]
}

const [centerX, centerY] = mercatorPx(...CAMPUS_MAP_CENTER)

/** Position relative to CAMPUS_MAP_CENTER, in CSS-px-at-CAMPUS_MAP_ZOOM units. */
function offset(lon: number, lat: number): [number, number] {
  const [x, y] = mercatorPx(lon, lat)
  return [x - centerX, y - centerY]
}

const routeLines = computed(() => buildRouteSegments(props.routes)
  .map((seg) => {
    const points = seg.points.map(([lon, lat]) => offset(lon, lat))
    return {
      id: seg.id,
      color: seg.color,
      dashed: seg.dashed,
      d: points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    }
  })
  // Solid pieces drawn last so they render on top at any boundary they
  // still share a pixel with a dashed piece, same reasoning as
  // CampusLiveMap's dashed-then-solid layer order.
  .sort((a, b) => Number(b.dashed) - Number(a.dashed)))

const stopDots = computed(() => {
  const byId = new Map<string, { id: string, x: number, y: number, terminal: boolean }>()
  for (const route of props.routes) {
    for (const stop of route.stops) {
      if (byId.has(stop.id)) continue
      const [x, y] = offset(stop.lon, stop.lat)
      byId.set(stop.id, { id: stop.id, x, y, terminal: !!stop.terminal })
    }
  }
  return [...byId.values()]
})
</script>

<template>
  <div
    ref="root"
    class="relative h-full w-full overflow-hidden bg-surface-3"
  >
    <!-- Blurred + slightly oversized: a 25KB screenshot shown at full sharp
         size reads as low-res/blocky (the exact "poco HD" look this was
         built to avoid) — blurring it is the standard LQIP treatment,
         hiding compression/resolution artifacts while still previewing the
         real shape/color of the route and terrain. Kept light (blur-sm, not
         blur-md/lg) so the map itself still reads through instead of just
         a gray haze — enough to hide artifacts, not so much it looks opaque.
         scale-110 keeps the blur from revealing the (blurred, but still
         visible) container edge. -->
    <div class="absolute inset-0 scale-110 blur-sm">
      <img
        :src="mapPlaceholder"
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
      >
      <svg
        class="absolute inset-0 h-full w-full"
        :viewBox="viewBox"
        preserveAspectRatio="none"
      >
        <path
          v-for="line in routeLines"
          :key="line.id"
          :d="line.d"
          fill="none"
          :stroke="`#${line.color}`"
          :stroke-width="line.dashed ? 3 : 4"
          :stroke-opacity="line.dashed ? 0.9 : 0.92"
          :stroke-dasharray="line.dashed ? '7,5' : undefined"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-for="stop in stopDots"
          :key="stop.id"
          :cx="stop.x"
          :cy="stop.y"
          :r="stop.terminal ? 6.5 : 4.5"
          fill="#fff"
          stroke="#0E1116"
          stroke-width="2.5"
        />
      </svg>
    </div>
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="map-spinner" />
    </div>
  </div>
</template>
