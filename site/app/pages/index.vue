<script setup lang="ts">
import type { GtfsRoute } from '~/types/gtfs'
import { copy } from '~/utils/copy'

const { data: routes, pending, error } = useSchedule()

const hacia = computed(() => routes.value?.filter(r => r.direction_id === 0) ?? [])
const desde = computed(() => routes.value?.filter(r => r.direction_id === 1) ?? [])

// The map is the 3rd section down (after Horarios/Tarifas) and depends on
// network round-trips to tiles.openfreemap.org that we don't control the
// speed of — mounting it only once it's about to scroll into view keeps it
// from competing with everything above it on initial page load.
// rootMargin gives it a 400px head start so tiles are already in flight by
// the time it's actually visible, instead of starting cold at that instant.
const mapsAnchor = useTemplateRef<HTMLDivElement>('mapsAnchor')
const mapsVisible = ref(false)
const { stop: stopMapsObserver } = useIntersectionObserver(
  mapsAnchor,
  ([entry]) => {
    if (entry?.isIntersecting) {
      mapsVisible.value = true
      stopMapsObserver()
    }
  },
  { rootMargin: '400px' }
)

// The 400px head start above only advances *when the component mounts* —
// it still had to wait for CampusLiveMap's own JS chunk to load, parse, and
// run onMounted before the very first map-asset request went out. This
// preload hint starts that request the instant the section is within
// range, in parallel with (not after) the chunk load, so by the time the
// map actually mounts, style.json is already in the browser's cache
// instead of a cold fetch.
useHead({
  link: computed(() => mapsVisible.value
    ? [{ rel: 'preload', as: 'fetch', href: '/tiles/style.json', crossorigin: 'anonymous' }]
    : [])
})

function flattenStops(list: GtfsRoute[]) {
  return list.flatMap(route => route.stops.map(stop => ({
    route_short_name: route.route_short_name,
    route_color: route.route_color,
    stop_name: stop.name,
    time: stop.scheduled_time
  })))
}

function dedupeStops(list: GtfsRoute[]) {
  const byId = new Map<string, { name: string, description?: string, routes: { name: string, color: string }[] }>()
  for (const route of list) {
    for (const stop of route.stops) {
      const entry = byId.get(stop.id) ?? { name: stop.name, description: stop.description, routes: [] }
      if (!entry.routes.some(r => r.name === route.route_short_name)) {
        entry.routes.push({ name: route.route_short_name, color: route.route_color })
      }
      byId.set(stop.id, entry)
    }
  }
  return [...byId.values()]
}

const horarioColumns = [
  { accessorKey: 'route_short_name', header: copy.horarios.route },
  { accessorKey: 'stop_name', header: copy.horarios.stop },
  { accessorKey: 'time', header: copy.horarios.time }
]

const paradaColumns = [
  { accessorKey: 'routes', header: copy.paradas.route },
  { accessorKey: 'name', header: copy.paradas.name },
  { accessorKey: 'description', header: copy.paradas.description }
]

const horarioTabs = computed(() => [
  { label: copy.horarios.hacia, sentido: copy.horarios.sentidoHacia, rows: flattenStops(hacia.value) },
  { label: copy.horarios.desde, sentido: copy.horarios.sentidoDesde, rows: flattenStops(desde.value) }
])

const paradaTabs = computed(() => [
  { label: copy.horarios.hacia, sentido: copy.horarios.sentidoHacia, rows: dedupeStops(hacia.value) },
  { label: copy.horarios.desde, sentido: copy.horarios.sentidoDesde, rows: dedupeStops(desde.value) }
])

// One map per direction, not per trip pattern — bUCR's schedule has 7 real
// patterns (outbound from Educación/Artes with/without the evening milla
// detour, 3 return variants), which read fine as separate rows in the
// Horarios table but would be 7 confusing tabs here. It's genuinely one
// route (bUCR_L1 in the real GTFS), so all patterns share one color; the
// legend below lets someone pick a pattern to see solid on the map instead
// of relying on hue to tell 7 near-identical lines apart.
const mapaTabs = computed(() => [
  { label: copy.horarios.hacia, sentido: copy.horarios.sentidoHacia, routes: hacia.value },
  { label: copy.horarios.desde, sentido: copy.horarios.sentidoDesde, routes: desde.value }
])

// Defaults to the most frequent pattern (same rule CampusLiveMap falls back
// to on its own) so the map's initial state and the legend's initial
// "active" highlight always agree without the user having to click anything.
function primaryPattern(list: GtfsRoute[]) {
  return list.reduce((best, r) => {
    const bestFreq = best?.frequency_minutes ?? Infinity
    const freq = r.frequency_minutes ?? Infinity
    return freq < bestFreq ? r : best
  }, list[0])?.route_id
}

const selectedPattern = ref<Record<string, string | undefined>>({})
function selectedFor(item: { label: string, routes: GtfsRoute[] }) {
  return selectedPattern.value[item.label] ?? primaryPattern(item.routes)
}

// Per-tab: has the real CampusLiveMap finished loading (vs. still showing
// MapPlaceholder)? Reset on unmount (see @vue:unmounted below) so
// switching tabs away and back shows the placeholder again during the
// remount's reload, instead of an instant-opaque map with nothing in it
// yet — Nuxt UI's tabs unmount inactive panels by default.
const mapLoaded = ref<Record<string, boolean>>({})

// Nuxt UI's default UPageSection padding (py-16 sm:py-24 lg:py-32, plus a
// mt-16 gap before the body) is meant for a marketing page with a handful
// of spaced-out sections — too much air for four short sections in a row
// here. text-toned (vs. the default text-muted) also reads more legibly
// for the section intro line.
const sectionUi = {
  // Nuxt UI's default is `py-16 sm:py-24 lg:py-32 gap-8 sm:gap-16` — every
  // breakpoint needs its own override here, or the un-overridden ones (e.g.
  // lg:py-32) keep winning at wider viewports since they don't conflict
  // with a same-breakpoint class from this object.
  container: 'py-4 sm:py-5 lg:py-5 gap-3 sm:gap-3',
  leading: 'mb-2',
  leadingIcon: 'size-6 text-primary',
  title: 'text-xl sm:text-4xl',
  description: 'mt-1 text-lg sm:text-xl text-toned',
  body: 'mt-4'
}

// The map reads cramped at the same max-width as a paragraph of text, but
// fully unbounded (max-w-none) let it grow arbitrarily wide on large
// monitors — MapPlaceholder's static basemap image is captured at one
// fixed reference size, and object-fit:cover has to crop/scale it more
// aggressively the further the container strays from that reference,
// which read as visibly mismatched. A fixed max a bit wider than the
// Paradas table below (60rem) keeps the map comfortably wide while giving
// MapPlaceholder a bounded, known target to match. max-w-[72rem] here
// wins over UPageSection's default max-w-(--ui-container) via
// tailwind-merge (both are max-w-* utilities).
const mapaSectionUi = { ...sectionUi, container: `${sectionUi.container} max-w-[72rem]` }

// text-muted (the UTable default) is too low-contrast for primary data;
// text-sm reads small for a schedule someone's checking at a glance.
// UTable's td is whitespace-nowrap by default — fine for short cells, but
// it forces the paradas table wider than the page for long descriptions.
const tableUi = { th: 'text-base', td: 'text-base text-toned whitespace-normal' }

useSeoMeta({
  title: copy.site.title,
  description: copy.site.description
})
</script>

<template>
  <div>
    <div class="w-full bg-gradient-to-r from-(--color-blue-900) to-(--color-blue-600)">
      <UContainer class="flex items-center gap-4 py-8 sm:py-25">
        <NuxtImg
          src="/b-blanco.png"
          alt=""
          width="150"
          height="150"
          class="h-30 w-30 shrink-0"
        />
        <div class="min-w-0">
          <p class="text-xl font-semibold text-white sm:text-6xl">
            {{ copy.hero.title }}
          </p>
          <p class="text-base text-blue-100 sm:text-lg">
            {{ copy.hero.description }}
          </p>
        </div>
      </UContainer>
    </div>

    <UPageSection
      id="horarios"
      icon="i-lucide-clock"
      :title="copy.horarios.title"
      :ui="sectionUi"
      class="scroll-mt-20"
    >
      <UAlert
        v-if="error"
        icon="i-lucide-info"
        color="neutral"
        variant="soft"
        :description="copy.horarios.error"
        class="mb-4"
      />
      <UTabs
        :items="horarioTabs"
        :ui="{ trigger: 'flex-1' }"
      >
        <template #content="{ item }">
          <p class="mb-3 text-xl font-semibold text-highlighted">
            {{ item.sentido }}
          </p>
          <UTable
            :data="item.rows"
            :columns="horarioColumns"
            :loading="pending"
            :empty="copy.horarios.empty"
            :ui="tableUi"
          >
            <template #route_short_name-cell="{ row }">
              <UBadge
                :style="{ backgroundColor: `#${row.original.route_color}` }"
                class="text-white"
              >
                {{ row.original.route_short_name }}
              </UBadge>
            </template>
          </UTable>
        </template>
      </UTabs>
    </UPageSection>

    <UPageSection
      id="tarifas"
      icon="i-lucide-ticket"
      :title="copy.tarifas.title"
      :description="copy.tarifas.description"
      :ui="sectionUi"
      class="scroll-mt-20"
    />

    <UPageSection
      id="mapas"
      icon="i-lucide-map"
      :title="copy.mapas.title"
      :description="copy.mapas.description"
      :ui="mapaSectionUi"
      class="scroll-mt-20"
    >
      <div ref="mapsAnchor">
        <UTabs
          :items="mapaTabs"
          :ui="{ trigger: 'flex-1' }"
        >
          <template #content="{ item }">
            <p class="mb-2 text-sm text-toned">
              {{ copy.mapas.legendHint }}
            </p>
            <div class="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
              <button
                v-for="route in item.routes"
                :key="route.route_id"
                type="button"
                class="flex items-center gap-1.5 rounded text-sm transition-opacity"
                :class="selectedFor(item) === route.route_id ? 'font-semibold text-highlighted opacity-100' : 'text-toned opacity-55 hover:opacity-80'"
                :aria-pressed="selectedFor(item) === route.route_id"
                @click="selectedPattern[item.label] = route.route_id"
              >
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: `#${route.route_color}` }"
                />
                {{ route.route_long_name }}
              </button>
            </div>
            <div class="relative h-[420px] overflow-hidden sm:h-[560px]">
              <!-- Wrapping divs (not a class passed straight to the
                   component) for the absolute-positioning/opacity — both
                   components already set their own root to `relative`
                   internally, which would collide with an `absolute`
                   fallthrough class and silently lose depending on
                   Tailwind's generated CSS order, pushing the real map
                   into normal document flow below the placeholder instead
                   of stacking on top of it. -->
              <div
                class="absolute inset-0 transition-opacity duration-300"
                :class="mapLoaded[item.label] ? 'opacity-0' : 'opacity-100'"
              >
                <!-- Always rendered (SSR-safe, no maplibre-gl) so there's a
                     real, accurate route preview from the very first paint
                     instead of a blank box or a generic spinner while the
                     real map loads. -->
                <MapPlaceholder
                  :routes="item.routes"
                  :selected="selectedFor(item)"
                />
              </div>
              <ClientOnly v-if="mapsVisible">
                <div
                  class="absolute inset-0 transition-opacity duration-300"
                  :class="mapLoaded[item.label] ? 'opacity-100' : 'opacity-0'"
                >
                  <CampusLiveMap
                    :routes="item.routes"
                    :selected="selectedFor(item)"
                    @loaded="mapLoaded[item.label] = true"
                    @vue:unmounted="mapLoaded[item.label] = false"
                  />
                </div>
              </ClientOnly>
            </div>
          </template>
        </UTabs>
      </div>
    </UPageSection>

    <UPageSection
      id="paradas"
      icon="i-lucide-map-pin"
      :title="copy.paradas.title"
      :ui="sectionUi"
      class="scroll-mt-20"
    >
      <UTabs
        :items="paradaTabs"
        :ui="{ trigger: 'flex-1' }"
      >
        <template #content="{ item }">
          <p class="mb-3 text-xl font-semibold text-highlighted">
            {{ item.sentido }}
          </p>
          <UTable
            :data="item.rows"
            :columns="paradaColumns"
            :loading="pending"
            :empty="copy.paradas.empty"
            :ui="tableUi"
          >
            <template #routes-cell="{ row }">
              <div class="flex gap-1">
                <UBadge
                  v-for="r in row.original.routes"
                  :key="r.name"
                  :style="{ backgroundColor: `#${r.color}` }"
                  class="text-white"
                >
                  {{ r.name }}
                </UBadge>
              </div>
            </template>
          </UTable>
        </template>
      </UTabs>
    </UPageSection>
  </div>
</template>
