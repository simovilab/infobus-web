// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@vueuse/nuxt'
  ],

  components: [{ path: '~/components', pathPrefix: false }],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css', 'maplibre-gl/dist/maplibre-gl.css'],

  runtimeConfig: {
    // URL of bUCR's real GTFS zip, downloaded+parsed server-side by
    // server/utils/bucrGtfs.ts (see server/plugins/gtfsSync.ts for the
    // hourly polling) to build the schedule shown on the site (see
    // server/utils/scheduleProvider.ts). Server-only (not under `public`)
    // since nothing fetches it from the browser — falls back to the
    // bundled copy in server/assets/gtfs/ if the remote fetch fails.
    // Override with env NUXT_GTFS_ZIP_URL.
    // TEMP: pointed at the bucr repo's own zip for testing since
    // feeds.simovi.org isn't serving the current data yet — switch back to
    // https://feeds.simovi.org/bucr/schedule/gtfs.zip once it is.
    gtfsZipUrl: 'https://raw.githubusercontent.com/simovilab/bucr/feature/static-website-gtfs/bucr.zip'
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    },
    // Verified via curl against the dev server that /tiles/** (style.json,
    // sprite, .pbf tiles) was going out with no Content-Encoding at all — a
    // 372 KB tile served fully uncompressed. Nitro pre-compresses build
    // output for public/ at build time (dev mode can't, since there's no
    // build step) and serves whichever encoding the client accepts.
    compressPublicAssets: { gzip: true, brotli: true },
    routeRules: {
      // The self-hosted basemap only changes when
      // scripts/fetch-basemap-tiles.mjs is re-run (a deploy), never per
      // request — verified the dev server was sending max-age=0, meaning
      // every repeat visit/tab switch re-downloaded the whole basemap from
      // network instead of the browser's own cache.
      '/tiles/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
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
