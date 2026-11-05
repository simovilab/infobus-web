<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintPosts
        :structure="structure"
        to="/news/sample-article"
      />
    </template>
  </BlueprintCard>
</template>
