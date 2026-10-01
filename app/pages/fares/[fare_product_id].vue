<script setup lang="ts">
const route = useRoute()
const fareProductId = computed(() => String(route.params.fare_product_id || ''))
</script>

<template>
  <UPageSection :title="`Fare Product ${fareProductId}`" />
  <UContainer>
    <FareProductHeader />
    <FareProductDescription />
  </UContainer>
</template>