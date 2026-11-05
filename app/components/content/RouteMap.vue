<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map of this route"
        icon="i-lucide-route"
        popup-label="Popup on the route line"
        feature-name="route"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
