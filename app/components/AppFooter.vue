<script setup lang="ts">

const route = useRoute()

const isDocs = computed(() => route.path === '/docs' || route.path.startsWith('/docs/'))

const columns = [{
  label: 'Resources',
  children: [{
    label: 'User guide',
    to: '/resources/guide'
  }, {
    label: 'Accessibility',
    to: '/resources/accessibility'
  }, {
    label: 'Tourism',
    to: '/resources/tourism'
  }]
}, {
  label: 'Service',
  children: [{
    label: 'Design',
    to: '/design'
  }, {
    label: 'Engineering',
    to: '/engineering'
  }, {
    label: 'Data',
    to: '/data'
  }, {
    label: 'Documentation',
    to: '/docs',
    active: isDocs.value    
  }]
}, {
  label: 'Institutional',
  children: [{
    label: 'Operators',
    to: '/operators'
  }, {
    label: 'FAQ',
    to: '/faq'
  }, {
    label: 'Legal',
    to: '/legal'
  }, {
    label: 'About',
    to: '/about'
  }]
}]

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  toast.add({
    title: 'Subscribed!',
    description: 'You\'ve been subscribed to our newsletter.'
  })
}
</script>

<template>
  <USeparator
    icon="i-simple-icons-nuxtdotjs"
    class="h-px"
  />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                label="Subscribe to our newsletter"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Enter your email"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      label="Subscribe"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-muted text-sm">
        Built with Nuxt UI • © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
        to="https://go.nuxt.com/discord"
        target="_blank"
        icon="i-simple-icons-discord"
        aria-label="Nuxt on Discord"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://go.nuxt.com/x"
        target="_blank"
        icon="i-simple-icons-x"
        aria-label="Nuxt on X"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://github.com/nuxt-ui-templates/saas"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="Nuxt UI on GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
