<script setup lang="ts">
const page = getArchitecturePage('/about')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>