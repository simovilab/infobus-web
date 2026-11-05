<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map of all regions"
        icon="i-lucide-shapes"
        popup-label="Popup on selected region"
        feature-name="region"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
