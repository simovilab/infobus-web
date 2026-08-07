// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap' },
        // CampusLiveMap (MapLibre, ported from feat/bucr-static-site) needs
        // style/sprite/glyph/tile round-trips to this host — preconnecting
        // now shaves off DNS+TLS setup once the map component lands.
        { rel: 'preconnect', href: 'https://tiles.openfreemap.org' }
      ]
    }
  },

  css: ['~/assets/css/main.css', 'maplibre-gl/dist/maplibre-gl.css'],

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  // maplibre-gl loads its tile-processing code in a Web Worker; Vite's dev
  // dependency pre-bundling doesn't serve that worker chunk correctly
  // (fails with ERR_FAILED), so it's excluded from pre-bundling here —
  // same fix as feat/bucr-static-site's nuxt.config.ts.
  vite: {
    optimizeDeps: { exclude: ['maplibre-gl'] }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
