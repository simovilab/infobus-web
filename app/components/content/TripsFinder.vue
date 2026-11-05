<script setup lang="ts">
const samples = [
  { label: 'Trip 1', to: '/trips/1' },
  { label: 'Trip 2', to: '/trips/2' },
  { label: 'Trip 3', to: '/trips/3' },
  { label: 'Trip 4', to: '/trips/4' }
]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintSearch
        :structure="structure"
        placeholder="Search a stop, a route or a destination…"
        to="/trips/1"
        :samples="samples"
      />
    </template>
  </BlueprintCard>
</template>
