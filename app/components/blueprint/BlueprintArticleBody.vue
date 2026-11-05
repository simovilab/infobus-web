<script setup lang="ts">
import type { ArchitectureStructure } from '~/utils/architecture'

// Stands in for the Markdown rendered by ContentRenderer; the entity names the Markdown source.
defineProps<{
  structure: ArchitectureStructure
}>()
</script>

<template>
  <div class="space-y-4">
    <p class="flex items-center gap-1 text-xs text-dimmed">
      <UIcon
        name="i-lucide-file-text"
        class="size-3.5"
      />
      Rendered from a Markdown file in <code>content/</code>
    </p>
    <BlueprintStructure :structure="structure" />
    <div
      class="space-y-3"
      aria-hidden="true"
    >
      <USkeleton class="h-6 w-1/3" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-11/12" />
      <USkeleton class="h-4 w-4/5" />
      <USkeleton class="h-40 w-full" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-3/4" />
    </div>
  </div>
</template>
