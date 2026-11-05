<script setup lang="ts">
const samples = [
  { label: 'Region 1', to: '/routes/regions/1' },
  { label: 'Region 2', to: '/routes/regions/2' },
  { label: 'Region 3', to: '/routes/regions/3' },
  { label: 'Region 4', to: '/routes/regions/4' }
]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintSearch
        :structure="structure"
        placeholder="Search regions by name or identifier…"
        result-name="region"
        to="/routes/regions/1"
        :samples="samples"
      />
    </template>
  </BlueprintCard>
</template>
