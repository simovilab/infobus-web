<script setup lang="ts">
const page = getArchitecturePage('/faq')
</script>

<template>
  <UPageSection :title="page.name" :description="page.description" />
</template>