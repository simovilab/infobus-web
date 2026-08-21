# bUCR — Infobús web

![Static Badge](https://img.shields.io/badge/frontend-Nuxt_4-white?logo=nuxt)
![Static Badge](https://img.shields.io/badge/ui-Nuxt_UI-white?logo=nuxt)
![Static Badge](https://img.shields.io/badge/maps-MapLibre_GL_JS-white?logo=mapbox)
![Static Badge](https://img.shields.io/badge/package_manager-pnpm-white?logo=pnpm)
![Static Badge](https://img.shields.io/badge/infrastructure-Docker-white?logo=docker)

Nuxt 4 site for [bUCR](https://github.com/simovilab/bucr), the UCR Rodrigo Facio campus internal bus. Renders schedules, fares, and stops from bUCR's static GTFS feed, plus an interactive campus map built with MapLibre GL JS. No backend of its own — see [Data](#data) below.

## Getting started

Requires Docker Engine and Docker Compose v2. From the repo root (not this directory):

```bash
git clone https://github.com/simovilab/infobus-web.git
cd infobus-web
docker compose -f compose.dev.yml up
```

Open http://localhost:3000. Source is bind-mounted, so edits reload live — no local Node/pnpm install needed. Test through this Docker setup rather than a bare `pnpm dev`, since production behavior (compression, caching, the prerendered build) only shows up in a real container.

### Common commands

```bash
# Logs
docker compose -f compose.dev.yml logs -f site

# Run a one-off command inside the container (lint, typecheck, etc.)
docker compose -f compose.dev.yml exec site pnpm lint
docker compose -f compose.dev.yml exec site pnpm typecheck

# Stop
docker compose -f compose.dev.yml down
```

## Production deployment

```bash
docker compose -f compose.prod.yml up -d --build
```

Builds the Nuxt app (`pnpm build`) into a standalone Node server (`.output/server/index.mjs`) in a separate runtime stage — no dev dependencies, no source bind-mount. Unlike [databus](https://github.com/simovilab/databus)/[infobus](https://github.com/simovilab/infobus)'s `compose.prod.yml`, there's no Traefik routing or domain config here yet — add it once this connects to real infra.

### Environment variables

See [`.env.example`](.env.example). `NUXT_GTFS_ZIP_URL` overrides which GTFS zip URL is polled (defaults to bUCR's real feed, `feeds.simovi.org/bucr/schedule/gtfs.zip` — see [Data](#data)); leave unset unless testing against a fork or local copy.

## Data

bUCR is modeled in GTFS as one route with several trip patterns (the evening *milla universitaria* detour, alternate Educación/Artes Plásticas termini); each pattern is treated as its own entry in the schedule shown here, since a single "route" badge wouldn't distinguish them.

- **[`server/utils/bucrGtfs.ts`](server/utils/bucrGtfs.ts)** — downloads bUCR's real GTFS zip server-side and parses `routes.txt`/`trips.txt`/`stop_times.txt`/`fare_attributes.txt`/`shapes.txt`/`stops.txt` directly (`server/utils/zip.ts` + `server/utils/csv.ts`, no external deps). Hash-gated: a sync that downloads the same bytes as last time re-serves the cached parsed data instead of re-parsing. Falls back to the bundled copy ([`server/assets/gtfs/`](server/assets/gtfs/)) if the remote fetch fails and nothing has been cached yet.
- **[`server/plugins/gtfsSync.ts`](server/plugins/gtfsSync.ts)** — runs that sync once on server start and then hourly, so requests just read the warm in-memory cache.
- **[`server/utils/scheduleProvider.ts`](server/utils/scheduleProvider.ts)** — turns the raw GTFS files into the schedule model the UI renders.
- Shapes and stops are converted to GeoJSON in `bucrGtfs.ts` (same shape as bucr's `shapes.geojson`/`stops.geojson`, not the raw per-row `shapes.txt`/`stops.txt`) — geometry built once here, not re-derived downstream. Same convention [incofer](https://github.com/simovilab/incofer) and databus/infobus's GeoDjango models use elsewhere in the ecosystem.
- `gtfsZipUrl` (`nuxt.config.ts` / env `NUXT_GTFS_ZIP_URL`) — server-only, since nothing fetches it from the browser.

## Map

`app/components/home/CampusLiveMap.client.vue` renders campus routes/stops with MapLibre GL JS over a self-hosted OpenFreeMap "positron" basemap (`public/tiles/`, regenerated with `pnpm exec node scripts/fetch-basemap-tiles.mjs`) — self-hosted rather than pointed at a live tile server so the campus-scale tile set (a few MB) doesn't depend on a third party's network latency or serve the full unrelated OpenMapTiles dataset per tile. `app/components/home/MapPlaceholder.vue` shows a static screenshot with the route drawn fresh as an SVG overlay while the live map loads.

Re-run the fetch script (and re-screenshot the placeholder) if the route's geographic area changes enough to fall outside its current bounding box.

## Contributing

See the [guidelines](https://github.com/simovilab/.github/blob/main/CONTRIBUTING.md).

## Contact

- Email: simovi@ucr.ac.cr
- Website: [simovi.org](https://simovi.org)

## License

Apache 2.0 — see [LICENSE](../LICENSE).
