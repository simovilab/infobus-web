<script setup lang="ts">
import type { ArchitectureStructure } from '~/utils/architecture'

// Mirrors the template's article header: badge · date headline, title, description, author buttons.
const props = defineProps<{
  structure: ArchitectureStructure
}>()

const title = computed(() => findEntity(props.structure, /\.title$/))
const description = computed(() => findEntity(props.structure, /\.description$/))
const date = computed(() => findEntity(props.structure, /\.(date|start_date)$/))
const badge = computed(() => findEntity(props.structure, /\.badge\.label$/))
const authors = computed(() => findNested(props.structure, 'authors'))

const covered = computed(() => new Set([title.value, description.value, date.value, badge.value]))
const others = computed(() => props.structure.values.filter((value): value is string => typeof value === 'string' && !covered.value.has(value)))
</script>

<template>
  <UPageHeader
    :title="title"
    :description="description"
    :ui="{ title: 'font-mono', description: 'font-mono text-base' }"
  >
    <template #headline>
      <UBadge
        v-if="badge"
        :label="badge"
        variant="subtle"
        class="font-mono"
      />
      <span
        v-if="badge && date"
        class="text-muted"
      >&middot;</span>
      <BlueprintEntity
        v-if="date"
        :entity="date"
        compact
      />
    </template>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <template v-if="authors">
        <UButton
          v-for="author in authors.values.filter(value => typeof value === 'string')"
          :key="String(author)"
          color="neutral"
          variant="subtle"
          size="sm"
          icon="i-lucide-circle-user-round"
          class="font-mono"
          :label="String(author)"
        />
      </template>
      <BlueprintEntity
        v-for="entity in others"
        :key="entity"
        :entity="entity"
        compact
      />
    </div>
  </UPageHeader>
</template>
