<script setup lang="ts">
/**
 * Test page: consumes bucr's static GTFS API directly (routes.json/
 * stops.json) via useGtfs, to verify the "pull by URL" pattern described in
 * the README live. Not part of the coming-soon's main navigation.
 */
const { getRoutes, getStops, getFeedInfo } = useGtfs()

const { data: routes, error: routesError } = await useAsyncData('gtfs-preview-routes', getRoutes)
const { data: stops, error: stopsError } = await useAsyncData('gtfs-preview-stops', getStops)
const { data: feedInfo } = await useAsyncData('gtfs-preview-feed-info', getFeedInfo)

const routeColumns = [
  { accessorKey: 'route_id', header: 'route_id' },
  { accessorKey: 'route_short_name', header: 'route_short_name' },
  { accessorKey: 'route_long_name', header: 'route_long_name' }
]

const stopColumns = [
  { accessorKey: 'stop_id', header: 'stop_id' },
  { accessorKey: 'stop_name', header: 'stop_name' },
  { accessorKey: 'stop_lat', header: 'stop_lat' },
  { accessorKey: 'stop_lon', header: 'stop_lon' }
]
</script>

<template>
  <UContainer class="py-10">
    <h1 class="text-2xl font-semibold mb-1">
      bUCR GTFS — pull-by-URL test
    </h1>
    <p class="text-toned mb-6">
      Data read live from
      <code>{{ useRuntimeConfig().public.gtfsApiBase }}</code>
      (falls back to <code>/api/</code> locally if the remote fetch fails).
      Feed: <strong>{{ feedInfo?.[0]?.feed_version }}</strong>
    </p>

    <UAlert
      v-if="routesError || stopsError"
      color="error"
      title="Could not load the GTFS feed"
      :description="String(routesError ?? stopsError)"
      class="mb-6"
    />

    <h2 class="text-lg font-medium mb-2">
      Routes ({{ routes?.length ?? 0 }})
    </h2>
    <UTable
      :data="routes ?? []"
      :columns="routeColumns"
      class="mb-8"
    />

    <h2 class="text-lg font-medium mb-2">
      Stops ({{ stops?.length ?? 0 }})
    </h2>
    <UTable
      :data="stops ?? []"
      :columns="stopColumns"
    />
  </UContainer>
</template>
