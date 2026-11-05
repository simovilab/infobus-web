<script setup lang="ts">
const samples = [
  { label: 'Stop 1', to: '/stops/1' },
  { label: 'Stop 2', to: '/stops/2' },
  { label: 'Stop 3', to: '/stops/3' },
  { label: 'Stop 4', to: '/stops/4' }
]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintSearch
        :structure="structure"
        placeholder="Search stops by name, code, location…"
        result-name="stop"
        to="/stops/1"
        :samples="samples"
      />
    </template>
  </BlueprintCard>
</template>
