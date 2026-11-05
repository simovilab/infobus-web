<script setup lang="ts">
const samples = [
  { label: 'Fare product 1', to: '/fares/1' },
  { label: 'Fare product 2', to: '/fares/2' },
  { label: 'Fare product 3', to: '/fares/3' },
  { label: 'Fare product 4', to: '/fares/4' }
]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintSearch
        :structure="structure"
        placeholder="Search fares by name, audience, zone or price…"
        result-name="fare product"
        to="/fares/1"
        :samples="samples"
      />
    </template>
  </BlueprintCard>
</template>
