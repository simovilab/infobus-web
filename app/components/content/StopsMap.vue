<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map of all stops"
        icon="i-lucide-map-pin"
        popup-label="Popup on selected stop"
        feature-name="stop"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
