<script setup lang="ts">
const route = useRoute()
const regionId = computed(() => String(route.params.region_id || ''))
</script>

<template>
  <BlueprintPage
    path="/routes/regions/<region_id>"
    :title="`Region ${regionId}`"
  >
    <RegionHeader class="lg:col-span-2" />
    <RegionRoutes />
    <RegionMap />
  </BlueprintPage>
</template>
