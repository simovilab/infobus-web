<script setup lang="ts">
const page = getArchitecturePage('/operators')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>