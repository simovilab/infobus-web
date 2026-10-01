<template>
  <UPageSection title="Alerts" />
  <UContainer>
    <AlertsSearch />
    <AlertsMenu />
    <div class="flex flex-col space-y-4">
      <NuxtLink to="/alerts/1">Go to Alert 1</NuxtLink>
      <NuxtLink to="/alerts/2">Go to Alert 2</NuxtLink>
      <NuxtLink to="/alerts/3">Go to Alert 3</NuxtLink>
      <NuxtLink to="/alerts/4">Go to Alert 4</NuxtLink>
    </div>
  </UContainer>
</template>