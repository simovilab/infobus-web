<script setup lang="ts">
const samples = [
  { label: 'Route 1', to: '/routes/1' },
  { label: 'Route 2', to: '/routes/2' },
  { label: 'Route 3', to: '/routes/3' },
  { label: 'Route 4', to: '/routes/4' }
]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintSearch
        :structure="structure"
        placeholder="Search routes by name, number, location…"
        result-name="route"
        to="/routes/1"
        :samples="samples"
      />
    </template>
  </BlueprintCard>
</template>
