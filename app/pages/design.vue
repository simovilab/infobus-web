<script setup lang="ts">
const page = getArchitecturePage('/design')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>