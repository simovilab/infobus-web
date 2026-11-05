<script setup lang="ts">
import type { ArchitectureStructure } from '~/utils/architecture'

const props = withDefaults(defineProps<{
  structure: ArchitectureStructure
  /** Root structures render arrays as several repeated items to convey a list. */
  root?: boolean
  /** Also repeat nested arrays (use sparingly: nesting multiplies the copies). */
  repeatNested?: boolean
  repeat?: number
}>(), {
  root: false,
  repeatNested: false,
  repeat: 3
})

const isArray = computed(() => props.structure.type === 'array')
const copies = computed(() => (isArray.value && (props.root || props.repeatNested) ? props.repeat : 1))
</script>

<template>
  <div class="w-full space-y-2 text-left">
    <div
      v-if="structure.name || !root"
      class="flex items-center gap-2 text-xs text-dimmed"
    >
      <span class="font-mono font-medium">{{ structure.name ?? 'item' }}</span>
      <UBadge
        color="neutral"
        variant="subtle"
        size="xs"
        :label="isArray ? 'array' : 'object'"
      />
    </div>

    <div class="space-y-3">
      <div
        v-for="copy in copies"
        :key="copy"
        class="flex flex-wrap items-baseline gap-x-4 gap-y-2 rounded-lg border border-dashed border-muted p-3"
        :class="copy > 1 ? 'opacity-50' : ''"
      >
        <template
          v-for="(value, index) in structure.values"
          :key="index"
        >
          <BlueprintEntity
            v-if="typeof value === 'string'"
            :entity="value"
          />
          <BlueprintStructure
            v-else
            :structure="value"
            :repeat-nested="repeatNested"
            class="basis-full"
          />
        </template>
      </div>
    </div>
  </div>
</template>
