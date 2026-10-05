<script setup lang="ts">
const page = getArchitecturePage('/resources/tourism')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>