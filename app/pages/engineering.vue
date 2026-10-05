<script setup lang="ts">
const page = getArchitecturePage('/engineering')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>