<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Page path in architecture notation, e.g. /routes/<route_id>. */
  path: string
  /** Overrides the page name, e.g. "Route 157" on detail pages. */
  title?: string
  columns?: 1 | 2
}>(), {
  title: undefined,
  columns: 2
})

const page = computed(() => getArchitecturePage(props.path))
</script>

<template>
  <div>
    <UPageSection
      :title="title ?? page.name"
      :description="page.description"
    />
    <UContainer
      class="grid gap-6 pb-16"
      :class="columns === 2 ? 'lg:grid-cols-2' : ''"
    >
      <slot />
    </UContainer>
  </div>
</template>
