<script setup lang="ts">
const route = useRoute()
const entityId = computed(() => String(route.params.entity_id || ''))
</script>

<template>
  <BlueprintPage
    path="/alerts/<entity_id>"
    :title="`Alert ${entityId}`"
  >
    <AlertHeader class="lg:col-span-2" />
    <AlertAffectedServices />
    <AlertPeriod />
    <AlertDescription />
    <AlertGuidance />
    <AlertMap class="lg:col-span-2" />
  </BlueprintPage>
</template>
