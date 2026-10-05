<script setup lang="ts">
const page = getArchitecturePage('/resources/accessibility')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>