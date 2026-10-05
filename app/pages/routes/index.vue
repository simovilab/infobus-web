<script setup lang="ts">
const page = getArchitecturePage('/routes')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
  <UContainer>
    <RoutesSearch />
    <RoutesMenu />
    <RoutesMap />
  </UContainer>
</template>