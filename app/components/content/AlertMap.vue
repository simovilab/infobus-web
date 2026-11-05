<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map of the affected area"
        icon="i-lucide-triangle-alert"
        popup-label="Popup on the detour"
        feature-name="detour"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
