<script setup lang="ts">
const page = getArchitecturePage('/trips')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
  <UContainer>
    <TripsSearch />
    <TripsMap />
    <div class="flex flex-col space-y-4">
      <NuxtLink to="/trips/1">Go to Trip 1</NuxtLink>
      <NuxtLink to="/trips/2">Go to Trip 2</NuxtLink>
      <NuxtLink to="/trips/3">Go to Trip 3</NuxtLink>
      <NuxtLink to="/trips/4">Go to Trip 4</NuxtLink>
    </div>
  </UContainer>
</template>