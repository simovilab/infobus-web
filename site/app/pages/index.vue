<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const items = ref([
  {
    label: 'Is Nuxt UI free to use?',
    content:
      'Yes! Nuxt UI is completely free and open source under the MIT license. All 100+ components are available to everyone.'
  },
  {
    label: 'Can I use Nuxt UI with Vue without Nuxt?',
    content:
      'Yes! While optimized for Nuxt, Nuxt UI works perfectly with standalone Vue projects via our Vite plugin. You can follow the [installation guide](/docs/getting-started/installation/vue) to get started.'
  },
  {
    label: 'Is Nuxt UI production-ready?',
    content:
      'Yes! Nuxt UI is used in production by thousands of applications with extensive tests, regular updates, and active maintenance.'
  }
])
</script>

<template>
  <div v-if="page">
    <UPageHero :title="page.title" :description="page.description" :links="page.hero.links">
      <template #top>
        <HeroBackground />
      </template>

      <template #title>
        <MDC :value="page.title" unwrap="p" />
      </template>

      <PromotionalVideo />

      <UAccordion :items="items" />
    </UPageHero>

    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
    >
      <ImagePlaceholder />
    </UPageSection>

    <UPageSection :title="page.features.title" :description="page.features.description">
      <UPageGrid>
        <UPageCard
          v-for="(item, index) in page.features.items"
          :key="index"
          v-bind="item"
          spotlight
        />
      </UPageGrid>
    </UPageSection>

    <UPageSection
      id="testimonials"
      :headline="page.testimonials.headline"
      :title="page.testimonials.title"
      :description="page.testimonials.description"
    >
      <UPageColumns class="xl:columns-4">
        <UPageCard
          v-for="(testimonial, index) in page.testimonials.items"
          :key="index"
          variant="subtle"
          :description="testimonial.quote"
          :ui="{
            description: 'before:content-[open-quote] after:content-[close-quote]'
          }"
        >
          <template #footer>
            <UUser v-bind="testimonial.user" size="lg" />
          </template>
        </UPageCard>
      </UPageColumns>
    </UPageSection>

    <USeparator />

    <UPageCTA v-bind="page.cta" variant="naked" class="overflow-hidden">
      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>
