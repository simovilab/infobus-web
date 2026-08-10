#!/usr/bin/env node
/**
 * Downloads a self-hosted copy of the OpenFreeMap "positron" basemap
 * (style + sprite + glyphs + vector tiles) scoped to the UCR Rodrigo Facio
 * campus, into public/tiles/. CampusLiveMap.client.vue then points at
 * /tiles/style.json instead of the live tiles.openfreemap.org style.
 *
 * Why self-host: OpenFreeMap serves the full OpenMapTiles vector dataset
 * regardless of style — a single tile near UCR measured ~370 KB, and the
 * map needed a grid of them (several MB total) just for what's meant to
 * look like a nearly-blank gray background with campus detail. Self-hosting
 * a small, fixed set of tiles for campus-scale zooms fixes that without
 * giving up the live MapLibre/vector-tile stack, and avoids depending on a
 * third-party host's network latency from wherever a visitor actually is.
 *
 * (There was a brief detour to a raster basemap — CARTO Positron, either
 * live or self-hosted — that traded this style's cartographic detail for a
 * flatter look. Turned out the real bottleneck wasn't the basemap at all,
 * it was Vite dev server's cold-compile tax on nuxt dev's first request
 * after a restart, which doesn't exist in production. So: back to this
 * richer vector style, self-hosted, with the compression/caching/worker
 * fixes from that detour kept.)
 *
 * Re-run this if the route's geographic area changes enough to fall
 * outside the bbox below. No need to cache anything past maxzoom 14 —
 * MapLibre overzooms (scales up the z14 tile) automatically for closer
 * zooms, real pan/zoom interactivity included.
 *
 * Usage: node scripts/fetch-basemap-tiles.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(ROOT, '..', 'public', 'tiles')
const UPSTREAM = 'https://tiles.openfreemap.org'

// Padded well beyond bUCR's real stop bounds (from bucr/api/stops.geojson,
// 2026.2 feed). fitBounds' padding is in *pixels*, not degrees, so how much
// extra geographic area it actually needs varies with container aspect
// ratio (a wide desktop viewport needs more horizontal area than a narrow
// one) — a tight pad left visible gaps (missing tiles = blank patches) on
// wider screens. Generous padding here is cheap; a visibly cropped map isn't.
const BBOX = { latMin: 9.924474, latMax: 9.957557, lonMin: -84.062162, lonMax: -84.032203 }
const ZOOM_MIN = 11
// OpenFreeMap's planet source caps out at maxzoom 14 (verified via its
// TileJSON) — tiles beyond that don't exist server-side and return empty
// responses if fetched directly. MapLibre automatically overzooms (scales
// up the z14 tile) for anything past this, as long as the style's source
// declares maxzoom: 14 (see below) so it knows to do that instead of
// requesting tiles that aren't there.
const ZOOM_MAX = 14

function tileXY(lat, lon, z) {
  const latRad = (lat * Math.PI) / 180
  const n = 2 ** z
  const x = Math.floor(((lon + 180) / 360) * n)
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n)
  return [x, y]
}

async function fetchBinary(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  console.log('Fetching style...')
  const style = await fetchJson(`${UPSTREAM}/styles/positron`)
  style.sprite = '/tiles/sprite'
  style.glyphs = '/tiles/fonts/{fontstack}/{range}.pbf'
  // The original source pointed `url` at OpenFreeMap's TileJSON endpoint,
  // which is where minzoom/maxzoom actually came from — replacing it with
  // an inline `tiles` template drops that metadata unless restated here.
  // Without maxzoom, MapLibre has no way to know it should overzoom
  // (render a scaled-up copy of the z14 tile) past the source's real
  // resolution, and instead requests tiles at whatever zoom the map is
  // at — which for z15+ don't exist (OpenFreeMap's planet source caps out
  // at maxzoom 14) and silently return empty responses.
  style.sources.openmaptiles.tiles = ['/tiles/{z}/{x}/{y}.pbf']
  style.sources.openmaptiles.minzoom = 0
  style.sources.openmaptiles.maxzoom = 14
  delete style.sources.openmaptiles.url
  // ne2_shaded is a low-zoom (maxzoom 6) world-scale backdrop for when
  // you're zoomed out past continents — irrelevant at campus scale, and
  // we're not caching those tiles, so drop the source/layer entirely
  // rather than leave a dangling reference to OpenFreeMap.
  delete style.sources.ne2_shaded
  style.layers = style.layers.filter(l => l.source !== 'ne2_shaded')
  await writeFile(join(OUT_DIR, 'style.json'), JSON.stringify(style))

  console.log('Fetching sprite...')
  const spriteJson = await fetchBinary(`${UPSTREAM}/sprites/ofm_f384/ofm.json`)
  const spritePng = await fetchBinary(`${UPSTREAM}/sprites/ofm_f384/ofm.png`)
  await writeFile(join(OUT_DIR, 'sprite.json'), spriteJson)
  await writeFile(join(OUT_DIR, 'sprite.png'), spritePng)

  // 0-255 covers all the accented characters in bUCR's stop names
  // (á é í ó ú ñ ü all fall within Latin-1 Supplement, U+00E1-U+00FC).
  // Add more ranges here if future labels need characters outside that.
  // All three weights are needed — Regular for our own stop labels, but
  // the upstream style's other label layers use Italic/Bold too; leaving
  // those uncached 404s per label MapLibre tries to draw with them.
  console.log('Fetching glyphs...')
  for (const fontstack of ['Noto Sans Regular', 'Noto Sans Italic', 'Noto Sans Bold']) {
    const fontDir = join(OUT_DIR, 'fonts', fontstack)
    await mkdir(fontDir, { recursive: true })
    const glyphRange = await fetchBinary(`${UPSTREAM}/fonts/${fontstack}/0-255.pbf`)
    await writeFile(join(fontDir, '0-255.pbf'), glyphRange)
  }

  console.log('Fetching tiles...')
  const tileTemplate = (await fetchJson(`${UPSTREAM}/planet`)).tiles[0]
  let tileCount = 0
  let totalBytes = 0
  for (let z = ZOOM_MIN; z <= ZOOM_MAX; z++) {
    const [x0, y0] = tileXY(BBOX.latMax, BBOX.lonMin, z)
    const [x1, y1] = tileXY(BBOX.latMin, BBOX.lonMax, z)
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const url = tileTemplate.replace('{z}', z).replace('{x}', x).replace('{y}', y)
        const data = await fetchBinary(url)
        const dir = join(OUT_DIR, String(z), String(x))
        await mkdir(dir, { recursive: true })
        await writeFile(join(dir, `${y}.pbf`), data)
        tileCount++
        totalBytes += data.length
      }
    }
    console.log(`  z${z} done`)
  }

  console.log(`Done: ${tileCount} tiles, ${(totalBytes / 1024 / 1024).toFixed(2)} MB total`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
