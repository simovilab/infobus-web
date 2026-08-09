# Nuxt SaaS Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Fully built SaaS application to launch your next project with a landing page, a pricing page, a documentation and a blog powered by [Nuxt UI](https://ui.nuxt.com) components.

- [Live demo](https://saas-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://saas-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/saas-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/saas-light.png">
    <img alt="Nuxt SaaS Template" src="https://ui.nuxt.com/assets/templates/nuxt/saas-light.png">
  </picture>
</a>

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t ui/saas
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=saas&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fsaas&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fsaas-dark.png&demo-url=https%3A%2F%2Fsaas-template.nuxt.dev%2F&demo-title=Nuxt%20SaaS%20Template&demo-description=A%20SaaS%20template%20with%20landing%2C%20pricing%2C%20docs%20and%20blog%20powered%20by%20Nuxt%20Content.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## GTFS data (bUCR)

The site consumes bUCR's GTFS feed as a static API published by the sibling
repo [`bucr`](https://github.com/simovilab/bucr) (`api/` folder, branch
`feature/static-website-gtfs`) — `bucr` is the single source of truth, this
repo doesn't duplicate the data.

- `useGtfs()` (`app/composables/useGtfs.ts`): typed functions (`getRoutes`,
  `getStops`, `getTrips`, etc.) that `$fetch` against
  `runtimeConfig.public.gtfsApiBase`, with in-memory per-session caching and
  automatic fallback to the local copy if the remote fetch fails.
- `gtfsApiBase` (`nuxt.config.ts` / env `NUXT_PUBLIC_GTFS_API_BASE`) defaults
  to `bucr`'s raw GitHub URL (`raw.githubusercontent.com` responds with
  `Access-Control-Allow-Origin: *`, so it works from the browser with no
  backend of its own and no CORS setup). Pointing it at `/api/` forces the
  local copy.
- `public/api/*.json`: offline fallback copy of `bucr/api/*.json` (same
  format — one array of objects per GTFS file). Refresh it by copying again
  from `bucr/api/` whenever the feed version changes.
- `/gtfs`: test page that lists routes and stops consuming the live feed, to
  verify the end-to-end pattern.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
