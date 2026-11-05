<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
import type { ArchitectureStructure } from '~/utils/architecture'

const props = withDefaults(defineProps<{
  /** Structure of one step (e.g. one stop); its title entity is shown as the step title. */
  structure: ArchitectureStructure
  titleEntity: string
  icons?: string[]
}>(), {
  icons: () => ['i-lucide-flag', 'i-lucide-map-pin', 'i-lucide-flag-triangle-right']
})

const steps = computed<StepperItem[]>(() => props.icons.map((icon, index) => ({ value: index, icon })))
const details = computed(() => ({ ...props.structure, values: props.structure.values.filter(value => value !== props.titleEntity) }))
</script>

<template>
  <UStepper
    :items="steps"
    orientation="vertical"
    :default-value="0"
    disabled
    :ui="{ description: 'mt-2' }"
  >
    <template #title>
      <BlueprintEntity
        :entity="titleEntity"
        compact
      />
    </template>
    <template #description>
      <BlueprintStructure :structure="details" />
    </template>
  </UStepper>
</template>
