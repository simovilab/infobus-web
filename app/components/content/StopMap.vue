<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map around this stop"
        icon="i-lucide-map-pin"
        popup-label="Popup on this stop"
        feature-name="stop"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
