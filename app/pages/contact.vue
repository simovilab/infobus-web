<script setup lang="ts">
const page = getArchitecturePage('/contact')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>