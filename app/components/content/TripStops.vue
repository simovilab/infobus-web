<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintStructure :structure="ownStructure(structure, 'bus position')" />
      <p class="text-xs text-dimmed">
        Every stop of the trip, in order, with scheduled and estimated times
      </p>
      <BlueprintSteps
        :structure="ownStructure(findStructure(structure, 'stop_times'), 'stop')"
        title-entity="stops.stop_name"
        :icons="['i-lucide-check', 'i-lucide-bus', 'i-lucide-flag-triangle-right']"
      />
      <BlueprintStructure :structure="findStructure(structure, 'replacement_stops')" />
    </template>
  </BlueprintCard>
</template>
