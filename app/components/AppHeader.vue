<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { open: searchOpen } = useContentSearch()

const open = ref(false)

const isDocs = computed(() => route.path === '/docs' || route.path.startsWith('/docs/'))

// Both modals portal to `body` with no z-index, so after a client-side layout
// change the menu can end up painted over the search
watch(searchOpen, (value) => {
  if (value) {
    open.value = false
  }
})

const items = computed(() => [{
  label: 'Home',
  to: '/',
}, {
  label: 'Routes',
  to: '/routes',
}, {
  label: 'Stops',
  to: '/stops',
}, {
  label: 'Trips',
  to: '/trips',
}, {
  label: 'Fares',
  to: '/fares',
}, {
  label: 'Alerts',
  to: '/alerts',
}, {
  label: 'News',
  to: '/news',
}, {
  label: 'Events',
  to: '/events',
}, {
  label: 'Blog',
  to: '/blog',
}, {
  label: 'Contact',
  to: '/contact',
}])
</script>

<template>
  <UHeader v-model:open="open">
    <template #left>
      <NuxtLink
        to="/"
        class="focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1"
      >
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>

    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <UContentSearchButton />

    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <template v-if="isDocs">
        <USeparator class="my-6" />

        <UContentNavigation
          :navigation="navigation"
          highlight
        />
      </template>
    </template>
  </UHeader>
</template>
