<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map of all routes"
        icon="i-lucide-route"
        popup-label="Popup on selected route"
        feature-name="route"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
