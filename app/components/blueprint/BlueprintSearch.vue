<script setup lang="ts">
import type { ArchitectureStructure } from '~/utils/architecture'

const props = withDefaults(defineProps<{
  /** An array (one result list) or an object whose nested arrays become result groups. */
  structure: ArchitectureStructure
  placeholder: string
  /** Name given to a single result when the structure is one array. */
  resultName?: string
  /** Where a result leads to, e.g. /stops/1. */
  to?: string
  /** Handy links while the real search is not wired up. */
  samples?: { label: string, to: string }[]
}>(), {
  resultName: 'result',
  to: undefined,
  samples: () => []
})

const groups = computed(() => {
  if (props.structure.type === 'array') {
    return [{
      id: 'results',
      label: 'Search result',
      ignoreFilter: true,
      items: [{ label: props.resultName, to: props.to, structure: { ...props.structure, name: props.resultName } }]
    }]
  }

  return nestedStructures(props.structure).map(nested => ({
    id: nested.name ?? 'results',
    label: `Results: ${nested.name}`,
    ignoreFilter: true,
    items: [{ label: nested.name, to: props.to, structure: nested }]
  }))
})

const own = computed(() => ownStructure(props.structure))
</script>

<template>
  <div class="space-y-4">
    <BlueprintStructure
      v-if="own.values.length && structure.type === 'object'"
      :structure="own"
    />
    <UCommandPalette
      :groups="groups"
      :placeholder="placeholder"
      icon="i-lucide-search"
      :close="false"
      class="rounded-lg border border-default"
    >
      <template #item="{ item }">
        <BlueprintStructure :structure="item.structure" />
      </template>
      <template
        v-if="samples.length"
        #footer
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-dimmed">
          <span>Sample pages:</span>
          <UButton
            v-for="sample in samples"
            :key="sample.to"
            :to="sample.to"
            :label="sample.label"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>
      </template>
    </UCommandPalette>
  </div>
</template>
