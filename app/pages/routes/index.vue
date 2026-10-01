<template>
  <UPageSection title="Routes" />
  <UContainer>
    <RoutesSearch />
    <RoutesMenu />
    <RoutesMap />
    <div class="flex flex-col space-y-4">
      <NuxtLink to="/routes/1">Go to Route 1</NuxtLink>
      <NuxtLink to="/routes/2">Go to Route 2</NuxtLink>
      <NuxtLink to="/routes/3">Go to Route 3</NuxtLink>
      <NuxtLink to="/routes/4">Go to Route 4</NuxtLink>
    </div>
  </UContainer>
</template>