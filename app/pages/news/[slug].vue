<script setup lang="ts">
const route = useRoute()
const articleId = computed(() => String(route.params.slug || ''))
</script>

<template>
  <UPageSection :title="`Article ${articleId}`" />
  <UContainer>
    <ArticleHeader />
    <ArticleBody />
  </UContainer>
</template>