<script setup lang="ts">
import type { ArchitectureComponent, ArchitectureStructure } from '~/utils/architecture'

const props = defineProps<{
  /** Component name as declared in architecture.yaml. Defaults to the parent component's name. */
  component?: string
  /** Page path in architecture notation (e.g. /routes/<route_id>). Defaults to the current route record. */
  page?: string
  /** Repeat nested arrays too, for components that are essentially one list. */
  repeatNested?: boolean
}>()

defineSlots<{
  default(props: { component: ArchitectureComponent, structure: ArchitectureStructure }): unknown
}>()

const route = useRoute()
const instance = getCurrentInstance()

const pagePath = computed(() => props.page ?? toArchitecturePath(route.matched.at(-1)?.path ?? route.path))
const componentName = computed(() => props.component ?? instance?.parent?.type.__name ?? '')
const blueprint = computed(() => getArchitectureComponent(pagePath.value, componentName.value))

const typeLabels: Record<ArchitectureComponent['type'], { label: string, icon: string }> = {
  feed: { label: 'Infobús API', icon: 'i-lucide-rss' },
  editorial_content: { label: 'Editorial', icon: 'i-lucide-pen-line' },
  local_storage: { label: 'On this device', icon: 'i-lucide-hard-drive' }
}
</script>

<template>
  <UCard
    variant="subtle"
    :ui="{ header: 'flex items-start justify-between gap-4', body: 'space-y-4' }"
  >
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          color="neutral"
          variant="soft"
          size="sm"
          :icon="typeLabels[blueprint.type].icon"
          :label="typeLabels[blueprint.type].label"
        />
        <UBadge
          v-if="blueprint.gtfs"
          color="neutral"
          variant="outline"
          size="sm"
          :label="`GTFS ${blueprint.gtfs}`"
        />
      </div>
      <UTooltip
        :text="blueprint.description"
        :delay-duration="0"
      >
        <UBadge
          color="primary"
          variant="solid"
          size="md"
          class="shrink-0 font-mono"
          :label="blueprint.name"
        />
      </UTooltip>
    </template>

    <p class="text-sm text-muted">
      {{ blueprint.description }}
    </p>

    <slot
      :component="blueprint"
      :structure="blueprint.structure"
    >
      <BlueprintStructure
        :structure="blueprint.structure"
        :repeat-nested="repeatNested"
        root
      />
    </slot>
  </UCard>
</template>
