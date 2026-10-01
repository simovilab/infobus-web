<script setup lang="ts">
const route = useRoute()
const alertId = computed(() => String(route.params.entity_id || ''))
</script>

<template>
  <UPageSection :title="`Alert ${alertId}`" />
  <UContainer>
    <AlertHeader />
    <AlertPeriod />
    <AlertDescription />
  </UContainer>
</template>