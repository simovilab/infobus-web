<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map of the chosen stop and its buses"
        icon="i-lucide-bus"
        popup-label="Popup on selected stop"
        feature-name="stop"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
