<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintMap
        label="Map of this region"
        icon="i-lucide-shapes"
        popup-label="Popup on the region"
        feature-name="region"
        :structure="structure"
      />
    </template>
  </BlueprintCard>
</template>
