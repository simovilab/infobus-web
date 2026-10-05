<script setup lang="ts">
const page = getArchitecturePage('/legal')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>