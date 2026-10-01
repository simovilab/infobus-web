<template>
  <UPageSection title="News" />
  <UContainer>
    <NewsSearch />
    <NewsMenu />
    <div class="flex flex-col space-y-4">
      <NuxtLink to="/news/1">Go to Article 1</NuxtLink>
      <NuxtLink to="/news/2">Go to Article 2</NuxtLink>
      <NuxtLink to="/news/3">Go to Article 3</NuxtLink>
      <NuxtLink to="/news/4">Go to Article 4</NuxtLink>
    </div>
  </UContainer>
</template>