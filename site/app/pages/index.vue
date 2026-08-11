<script setup lang="ts">
import type { GtfsRoute } from '~/types/gtfs'
import { copy } from '~/utils/copy'

const { data: routes, pending, error } = useSchedule()

/**
 * bUCR has two real origins (Educación, Artes Plásticas), both ending at
 * Odontología — this groups every pattern by origin first, direction
 * second, matching the printed schedule's own convention (see copy.ts).
 * "Artes Plásticas" appearing in direction_destinations is what tells the
 * two groups apart; the late-night Odontología→EDUFI trip has no
 * "Artes Plásticas" destination, so it falls into the Educación group's
 * "Odontología → Educación" sentido alongside the regular return trips,
 * same as the printed schedule folds it in as a footnote rather than its
 * own column.
 */
function grupoIdFor(route: GtfsRoute) {
  return route.direction_destinations?.includes('Artes Plásticas') ? 'artes' : 'educacion'
}

const grupos = computed(() => copy.grupos.map(g => ({
  id: g.id,
  label: g.label,
  sentidos: g.sentidos.map(s => ({
    label: s.label,
    key: `${g.id}-${s.direction_id}`,
    routes: (routes.value ?? []).filter(r => grupoIdFor(r) === g.id && r.direction_id === s.direction_id)
  }))
})))

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

// A Horarios table lists every real departure a rider could catch — not
// one representative trip's full stop-by-stop path (that's what
// route.stops is for: the map, and tramo). Sorted chronologically across
// every pattern in the sentido (sin_milla and its con_milla variant
// interleave naturally here, since milla departures are simply later).
function flattenDepartures(list: GtfsRoute[]) {
  return list
    .flatMap(route => (route.departures ?? []).map(time => ({
      route_short_name: route.route_short_name,
      route_color: route.route_color,
      // direction_destinations is [origin, destination] for this specific
      // pattern — constant across every row in a given sentido (that's the
      // whole point of the sentido split), but shown explicitly rather than
      // only implied by the tab label above the table.
      from: route.direction_destinations?.[0] ?? '',
      time,
      // Every row in a Horarios table now shares one sentido (see
      // route_short_name's note above) — these are the only two things
      // that can still differ trip-to-trip within it, so they get their
      // own small chip next to the route badge and the time.
      is_milla: !!route.is_milla,
      is_edufi: !!route.direction_destinations?.includes('EDUFI')
    })))
    .sort((a, b) => a.time.localeCompare(b.time))
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
  { accessorKey: 'from', header: copy.horarios.from },
  { accessorKey: 'time', header: copy.horarios.time }
]

const paradaColumns = [
  { accessorKey: 'routes', header: copy.paradas.route },
  { accessorKey: 'name', header: copy.paradas.name },
  { accessorKey: 'description', header: copy.paradas.description }
]

const horarioGrupos = computed(() => grupos.value.map(g => ({
  ...g,
  sentidos: g.sentidos.map(s => ({ ...s, rows: flattenDepartures(s.routes) }))
})))

const paradaGrupos = computed(() => grupos.value.map(g => ({
  ...g,
  sentidos: g.sentidos.map(s => ({ ...s, rows: dedupeStops(s.routes) }))
})))

// Each sentido has at most two patterns: the regular one and its evening
// milla variant (GtfsRoute.is_milla) — the map draws both automatically
// (solid + dashed, see CampusLiveMap/MapPlaceholder), so there's no
// legend/selection UI needed here, just a note when a milla variant exists
// for the currently open sentido.
function millaRoute(list: GtfsRoute[]) {
  return list.find(r => r.is_milla)
}

// The one late-night "Odontología → Educación" trip that actually ends at
// EDUFI instead — same treatment as the milla variant, a note rather than
// its own tab (see grupoIdFor above for why it's folded into that sentido).
function edufiRoute(list: GtfsRoute[]) {
  return list.find(r => r.direction_destinations?.includes('EDUFI'))
}

// The two big group tabs above (UTabs, same look as Horarios/Tarifas/etc.)
// and this small sentido toggle deliberately look nothing alike — same
// size/style for both read as two sliders doing the same thing, which is
// disorienting. Each section (Horarios/Paradas/Mapas) tracks its own active
// sentido per group independently, same as they already did as separate
// UTabs instances before this.
function activeSentido<T extends { key: string }>(state: Record<string, string>, grupo: { id: string, sentidos: T[] }): T {
  const key = state[grupo.id] ?? grupo.sentidos[0]?.key
  return grupo.sentidos.find(s => s.key === key) ?? grupo.sentidos[0]!
}
const horarioSentido = ref<Record<string, string>>({})
const paradaSentido = ref<Record<string, string>>({})
const mapaSentido = ref<Record<string, string>>({})

// Per-sentido: has the real CampusLiveMap finished loading (vs. still
// showing MapPlaceholder)? Reset on unmount (see @vue:unmounted below) so
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
        :items="horarioGrupos"
        :ui="{ trigger: 'flex-1' }"
      >
        <template #content="{ item: grupo }">
          <UFieldGroup class="mt-4 mb-3">
            <UButton
              v-for="sentido in grupo.sentidos"
              :key="sentido.key"
              :color="activeSentido(horarioSentido, grupo).key === sentido.key ? 'primary' : 'neutral'"
              :variant="activeSentido(horarioSentido, grupo).key === sentido.key ? 'solid' : 'outline'"
              @click="horarioSentido[grupo.id] = sentido.key"
            >
              {{ sentido.label }}
            </UButton>
          </UFieldGroup>
          <UTable
            :data="activeSentido(horarioSentido, grupo).rows"
            :columns="horarioColumns"
            :loading="pending"
            :empty="copy.horarios.empty"
            :ui="tableUi"
          >
            <template #route_short_name-cell="{ row }">
              <div class="flex items-center gap-2">
                <UBadge
                  :style="{ backgroundColor: `#${row.original.route_color}` }"
                  class="text-white"
                >
                  {{ row.original.route_short_name }}
                </UBadge>
                <UBadge
                  v-if="row.original.is_milla"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  con milla
                </UBadge>
                <UBadge
                  v-if="row.original.is_edufi"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  EDUFI
                </UBadge>
              </div>
            </template>
            <template #time-cell="{ row }">
              <div class="flex items-center gap-2">
                {{ row.original.time }}
                <UBadge
                  v-if="row.original.is_milla"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  con milla
                </UBadge>
                <UBadge
                  v-if="row.original.is_edufi"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  EDUFI
                </UBadge>
              </div>
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
          :items="grupos"
          :ui="{ trigger: 'flex-1' }"
        >
          <template #content="{ item: grupo }">
            <UFieldGroup class="mt-4 mb-3">
              <UButton
                v-for="sentido in grupo.sentidos"
                :key="sentido.key"
                :color="activeSentido(mapaSentido, grupo).key === sentido.key ? 'primary' : 'neutral'"
                :variant="activeSentido(mapaSentido, grupo).key === sentido.key ? 'solid' : 'outline'"
                @click="mapaSentido[grupo.id] = sentido.key"
              >
                {{ sentido.label }}
              </UButton>
            </UFieldGroup>
            <!-- v-if (not v-show) — only the active sentido's map should
                 ever be mounted, both to avoid running two maplibre-gl
                 instances at once and so mapLoaded resets cleanly via
                 @vue:unmounted below when switching sentido, same as
                 switching used to unmount the old UTabs panel. -->
            <template
              v-for="sentido in grupo.sentidos"
              :key="sentido.key"
            >
              <div v-if="activeSentido(mapaSentido, grupo).key === sentido.key">
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
                    :class="mapLoaded[sentido.key] ? 'opacity-0' : 'opacity-100'"
                  >
                    <!-- Always rendered (SSR-safe, no maplibre-gl) so there's a
                         real, accurate route preview from the very first paint
                         instead of a blank box or a generic spinner while the
                         real map loads. -->
                    <MapPlaceholder :routes="sentido.routes" />
                  </div>
                  <ClientOnly v-if="mapsVisible">
                    <div
                      class="absolute inset-0 transition-opacity duration-300"
                      :class="mapLoaded[sentido.key] ? 'opacity-100' : 'opacity-0'"
                    >
                      <CampusLiveMap
                        :routes="sentido.routes"
                        @loaded="mapLoaded[sentido.key] = true"
                        @vue:unmounted="mapLoaded[sentido.key] = false"
                      />
                    </div>
                  </ClientOnly>
                </div>
                <p
                  v-if="millaRoute(sentido.routes)"
                  class="mt-2 text-sm text-toned"
                >
                  {{ copy.mapas.millaNote(millaRoute(sentido.routes)!.first_bus!) }}
                </p>
                <p
                  v-if="edufiRoute(sentido.routes)"
                  class="mt-2 text-sm text-toned"
                >
                  {{ copy.mapas.edufiNote(edufiRoute(sentido.routes)!.first_bus!) }}
                </p>
              </div>
            </template>
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
        :items="paradaGrupos"
        :ui="{ trigger: 'flex-1' }"
      >
        <template #content="{ item: grupo }">
          <UFieldGroup class="mt-4 mb-3">
            <UButton
              v-for="sentido in grupo.sentidos"
              :key="sentido.key"
              :color="activeSentido(paradaSentido, grupo).key === sentido.key ? 'primary' : 'neutral'"
              :variant="activeSentido(paradaSentido, grupo).key === sentido.key ? 'solid' : 'outline'"
              @click="paradaSentido[grupo.id] = sentido.key"
            >
              {{ sentido.label }}
            </UButton>
          </UFieldGroup>
          <UTable
            :data="activeSentido(paradaSentido, grupo).rows"
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
