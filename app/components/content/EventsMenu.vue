<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintPosts
        :structure="structure"
        to="/events/sample-event"
      />
    </template>
  </BlueprintCard>
</template>
