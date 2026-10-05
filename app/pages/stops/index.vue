<script setup lang="ts">
const page = getArchitecturePage('/stops')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
  <UContainer>
    <StopsSearch />
    <StopsMap />
    <div class="flex flex-col space-y-4">
      <NuxtLink to="/stops/1">Go to Stop 1</NuxtLink>
      <NuxtLink to="/stops/2">Go to Stop 2</NuxtLink>
      <NuxtLink to="/stops/3">Go to Stop 3</NuxtLink>
      <NuxtLink to="/stops/4">Go to Stop 4</NuxtLink>
    </div>
  </UContainer>
</template>