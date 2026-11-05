<script setup lang="ts">
import type { ArchitectureStructure } from '~/utils/architecture'

// Mirrors the template's UBlogPosts grid: each card's text is the entity that will fill it.
const props = defineProps<{
  /** Array structure of posts (news, blog posts, events) with .title, .description, .date… entities. */
  structure: ArchitectureStructure
  /** Where a post leads to, e.g. /news/sample-article. */
  to?: string
}>()

const title = computed(() => findEntity(props.structure, /\.title$/))
const description = computed(() => findEntity(props.structure, /\.description$/))
const date = computed(() => findEntity(props.structure, /\.(date|start_date)$/))
const badge = computed(() => findEntity(props.structure, /\.badge\.label$/))
const image = computed(() => findEntity(props.structure, /\.image\.src$/))
const authors = computed(() => findNested(props.structure, 'authors'))

const covered = computed(() => new Set([title.value, description.value, date.value, badge.value, image.value]))
const others = computed(() => props.structure.values.filter((value): value is string => typeof value === 'string' && !covered.value.has(value)))
const authorEntities = computed(() => authors.value?.values.filter((value): value is string => typeof value === 'string') ?? [])
</script>

<template>
  <UBlogPosts class="lg:gap-y-8">
    <UBlogPost
      v-for="index in 3"
      :key="index"
      :to="to"
      :title="title"
      :description="description"
      :date="date"
      :badge="badge ? { label: badge } : undefined"
      :orientation="index === 1 ? 'horizontal' : 'vertical'"
      :class="[index === 1 && 'col-span-full', index > 1 && 'opacity-60']"
      variant="naked"
      :ui="{ body: 'px-0 sm:px-0', title: 'font-mono text-base', description: 'font-mono text-xs', date: 'font-mono text-xs', badge: 'font-mono' }"
    >
      <template #header>
        <div class="flex aspect-video items-center justify-center gap-2 rounded-lg bg-elevated text-sm text-dimmed">
          <UIcon
            name="i-lucide-image"
            class="size-5"
          />
          <span class="font-mono">{{ image ?? 'image' }}</span>
        </div>
      </template>
      <template
        v-if="authorEntities.length || others.length"
        #authors
      >
        <UBadge
          v-for="author in authorEntities"
          :key="author"
          color="neutral"
          variant="subtle"
          size="sm"
          class="font-mono"
          icon="i-lucide-user"
          :label="author"
        />
        <BlueprintEntity
          v-for="entity in others"
          :key="entity"
          :entity="entity"
          compact
        />
      </template>
    </UBlogPost>
  </UBlogPosts>
</template>
