<template>
  <UPageSection title="Fares" />
  <UContainer>
    <FaresSearch />
    <FaresProductMenu />
    <div class="flex flex-col space-y-4">
      <NuxtLink to="/fares/1">Go to Fare Product 1</NuxtLink>
      <NuxtLink to="/fares/2">Go to Fare Product 2</NuxtLink>
      <NuxtLink to="/fares/3">Go to Fare Product 3</NuxtLink>
      <NuxtLink to="/fares/4">Go to Fare Product 4</NuxtLink>
    </div>
  </UContainer>
</template>