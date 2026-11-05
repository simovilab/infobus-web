<script setup lang="ts">
const samples = [{ label: 'Sample article', to: '/news/sample-article' }]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintSearch
        :structure="structure"
        placeholder="Search news by topic, date or keyword…"
        result-name="article"
        to="/news/sample-article"
        :samples="samples"
      />
    </template>
  </BlueprintCard>
</template>
