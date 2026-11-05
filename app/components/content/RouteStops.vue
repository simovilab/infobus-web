<script setup lang="ts">
// Static tabs: one per direction of travel, labelled with the entity a real tab would show.
const directionTabs = [
  { label: 'trips.trip_headsign', icon: 'i-lucide-arrow-right' },
  { label: 'trips.trip_headsign', icon: 'i-lucide-arrow-left' }
]
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <UTabs
        :items="directionTabs"
        :content="false"
        color="neutral"
        :ui="{ trigger: 'font-mono text-xs' }"
      />
      <BlueprintStructure :structure="ownStructure(structure, 'direction')" />
      <p class="text-xs text-dimmed">
        Stops in order of travel for the selected direction
      </p>
      <BlueprintSteps
        :structure="ownStructure(findStructure(structure, 'stops'), 'stop')"
        title-entity="stops.stop_name"
      />
    </template>
  </BlueprintCard>
</template>
