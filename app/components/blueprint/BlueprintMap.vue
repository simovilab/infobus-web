<script setup lang="ts">
import type { ArchitectureStructure } from '~/utils/architecture'

const props = withDefaults(defineProps<{
  /** Caption shown in the top-left corner of the map canvas. */
  label: string
  /** Watermark icon hinting at what the map draws. */
  icon?: string
  /** Caption of the popup shown for a selected feature. */
  popupLabel: string
  /** Full component structure: own entities go to the popup, nested structures become layers. */
  structure: ArchitectureStructure
  /** Name of the selected feature in the popup, e.g. "stop". */
  featureName?: string
}>(), {
  icon: 'i-lucide-map-pin',
  featureName: 'feature'
})

const popup = computed(() => ownStructure(props.structure, props.featureName))
const layers = computed(() => nestedStructures(props.structure))
</script>

<template>
  <div class="relative flex min-h-96 flex-col gap-12 rounded-lg border border-default bg-muted bg-[radial-gradient(var(--ui-border-accented)_1px,transparent_1px)] bg-[size:20px_20px] p-4">
    <div class="flex items-start justify-between gap-4">
      <UBadge
        color="neutral"
        variant="solid"
        size="sm"
        icon="i-lucide-map"
        :label="label"
      />
      <UFieldGroup
        orientation="vertical"
        size="sm"
      >
        <UButton
          color="neutral"
          variant="solid"
          icon="i-lucide-plus"
          aria-label="Zoom in"
        />
        <UButton
          color="neutral"
          variant="solid"
          icon="i-lucide-minus"
          aria-label="Zoom out"
        />
      </UFieldGroup>
    </div>

    <UIcon
      :name="icon"
      class="pointer-events-none absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 text-dimmed/40"
    />

    <div
      v-if="layers.length"
      class="relative ml-auto w-full max-w-sm space-y-3 rounded-lg bg-default/90 p-3 ring-1 ring-default backdrop-blur-sm"
    >
      <p class="flex items-center gap-1 text-xs text-dimmed">
        <UIcon
          name="i-lucide-layers"
          class="size-3.5"
        />
        Layers drawn on the map
      </p>
      <BlueprintStructure
        v-for="layer in layers"
        :key="layer.name"
        :structure="layer"
      />
    </div>

    <div
      v-if="popup.values.length"
      class="relative mt-auto w-full max-w-sm rounded-lg bg-default p-3 shadow-lg ring-1 ring-default"
    >
      <span class="absolute -bottom-2 left-6 size-4 rotate-45 bg-default ring-1 ring-default" />
      <p class="mb-2 flex items-center gap-1 text-xs text-dimmed">
        <UIcon
          name="i-lucide-mouse-pointer-click"
          class="size-3.5"
        />
        {{ popupLabel }}
      </p>
      <BlueprintStructure :structure="popup" />
    </div>
  </div>
</template>
