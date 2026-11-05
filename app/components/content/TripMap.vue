<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map of this trip"
        icon="i-lucide-bus"
        popup-label="Popup on the bus"
        feature-name="bus"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
