<script setup lang="ts">
const samples = [{ label: 'Sample event', to: '/events/sample-event' }]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintSearch
        :structure="structure"
        placeholder="Search events by date, location or topic…"
        result-name="event"
        to="/events/sample-event"
        :samples="samples"
      />
    </template>
  </BlueprintCard>
</template>
