<script setup lang="ts">
const page = getArchitecturePage('/events')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
  <UContainer>
    <EventsSearch />
    <EventsMenu />
    <div class="flex flex-col space-y-4">
      <NuxtLink to="/events/1">Go to Event 1</NuxtLink>
      <NuxtLink to="/events/2">Go to Event 2</NuxtLink>
      <NuxtLink to="/events/3">Go to Event 3</NuxtLink>
      <NuxtLink to="/events/4">Go to Event 4</NuxtLink>
    </div>
  </UContainer>
</template>