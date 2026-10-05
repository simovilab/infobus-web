<script setup lang="ts">
const page = getArchitecturePage('/resources')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>