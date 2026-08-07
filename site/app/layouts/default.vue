<script setup lang="ts">
import { copy } from '~/utils/copy'
</script>

<template>
  <div>
    <UHeader
      :title="copy.site.title"
      to="/"
    >
      <template #title>
        <NuxtImg
          src="/logo-bucr.png"
          alt=""
          width="28"
          height="28"
          class="h-7 w-7"
        />
        {{ copy.site.title }}
      </template>

      <UNavigationMenu
        :items="copy.nav"
        :ui="{ link: 'text-base' }"
      />

      <template #body>
        <UNavigationMenu
          :items="copy.nav"
          orientation="vertical"
          :ui="{ link: 'text-base' }"
        />
      </template>
    </UHeader>

    <slot />

    <UFooter :ui="{ root: 'border-t border-default bg-elevated/50' }">
      <template #left>
        <NuxtImg
          src="/logo-bucr.png"
          alt=""
          width="24"
          height="24"
          class="h-6 w-6"
        />
        <span class="font-semibold text-highlighted">{{ copy.site.title }}</span>
        <span class="text-toned">· {{ copy.footer }}</span>
      </template>

      <template #right>
        <UNavigationMenu
          :items="copy.nav"
          size="xs"
        />
      </template>
    </UFooter>
  </div>
</template>
