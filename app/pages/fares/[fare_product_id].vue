<script setup lang="ts">
const route = useRoute()
const fare_productId = computed(() => String(route.params.fare_product_id || ''))
</script>

<template>
  <BlueprintPage
    path="/fares/<fare_product_id>"
    :title="`Fare product ${fare_productId}`"
  >
    <FareProductHeader class="lg:col-span-2" />
    <FareProductRules />
    <FareProductDescription />
  </BlueprintPage>
</template>
