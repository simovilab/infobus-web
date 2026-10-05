<script setup lang="ts">
const page = getArchitecturePage('/resources/guide')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>