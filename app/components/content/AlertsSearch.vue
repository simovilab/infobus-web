<script setup lang="ts">
const samples = [
  { label: 'Alert 1', to: '/alerts/1' },
  { label: 'Alert 2', to: '/alerts/2' },
  { label: 'Alert 3', to: '/alerts/3' },
  { label: 'Alert 4', to: '/alerts/4' }
]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintSearch
        :structure="structure"
        placeholder="Search a route, stop or operator…"
        to="/alerts/1"
        :samples="samples"
      />
    </template>
  </BlueprintCard>
</template>
