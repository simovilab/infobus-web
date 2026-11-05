<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <BlueprintPosts
        :structure="structure"
        to="/blog/sample-post"
      />
    </template>
  </BlueprintCard>
</template>
