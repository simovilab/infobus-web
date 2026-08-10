# Infobús web

![Static Badge](https://img.shields.io/badge/frontend-Nuxt-white?logo=nuxt)
![Static Badge](https://img.shields.io/badge/maps-MapLibre_GL_JS-white?logo=mapbox)
![Static Badge](https://img.shields.io/badge/infrastructure-Docker-white?logo=docker)
![Static Badge](https://img.shields.io/badge/docs-Zensical-white?logo=materialformkdocs)

Public-facing website for [Infobús](https://github.com/simovilab/infobus), SIMOVI's real-time public transportation information system. Currently serving [bUCR](https://github.com/simovilab/bucr) (the UCR Rodrigo Facio campus internal bus) as a static schedule site — no backend of its own, no GTFS Realtime yet. It reads bUCR's published static GTFS feed directly and renders schedules, fares, and an interactive campus map.

## Repository layout

| Path      | What                                                                     |
| --------- | ------------------------------------------------------------------------ |
| [`site/`](site/) | The Nuxt 4 web app — see [site/README.md](site/README.md) for setup |
| [`docs/`](docs/) | Project documentation, built with [Zensical](https://zensical.org/) |

## Data flow

```
bucr (GTFS Schedule feed, api/*.json + *.geojson)
  → raw.githubusercontent.com
    → site/server/utils/bucrGtfs.ts (server-side fetch, cached, with a bundled fallback)
      → site/server/utils/scheduleProvider.ts (shapes into the site's schedule model)
        → rendered on the home page
```

bUCR is the single source of truth for the schedule. This repo doesn't duplicate GTFS data — shapes and stops are consumed as GeoJSON ([`shapes.geojson`](https://github.com/simovilab/bucr/blob/main/api/shapes.geojson) / [`stops.geojson`](https://github.com/simovilab/bucr/blob/main/api/stops.geojson)), the same convention used by [incofer](https://github.com/simovilab/incofer) and databus/infobus's GeoDjango models: geometry is built once at the source, not re-derived by every consumer.

## Getting started

See [site/README.md](site/README.md) for running the web app (Docker, dev and production). See [docs/](docs/) for the documentation site.

## Contributing

See the [guidelines](https://github.com/simovilab/.github/blob/main/CONTRIBUTING.md).

## Contact

- Email: simovi@ucr.ac.cr
- Website: [simovi.org](https://simovi.org)

## License

See [LICENSE](site/LICENSE).
