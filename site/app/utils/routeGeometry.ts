import type { GtfsRoute } from '~/types/gtfs'

/**
 * Turns the raw per-route GTFS shapes handed to the map (CampusLiveMap,
 * MapPlaceholder) into the actual polylines that should be drawn, fixing
 * two things plain "one line per route" rendering gets wrong for bUCR:
 *
 * 1. A con_milla shape's dashed styling should cover only the ~1km "milla
 *    universitaria" loop it adds over its sin_milla counterpart, not the
 *    whole shape — most of a con_milla shape is the same trunk road as the
 *    regular pattern.
 * 2. Shapes that physically share a road for long stretches (e.g. the
 *    milla trunk, or desde_edufi_a_educacion vs desde_odontologia_a_educacion
 *    being near-fully coincident) must not draw as doubled/thicker lines —
 *    only the first shape to claim a stretch draws it; later shapes skip
 *    the parts already covered and draw only what's actually new.
 *
 * Both algorithms (and their thresholds) port the logic simovilab/databus-sim
 * uses for its own "highlight route" map, adapted from meters-based GPS
 * shapes to this app's GtfsRoute[] + [lon,lat] shape points.
 */

export type LngLatTuple = [number, number]

export interface RouteSegment {
  /** Stable per-piece id (a shape can produce several pieces) — use as the render key, not routeId. */
  id: string
  routeId: string
  /** Hex, no '#' — lightened (blended toward white) for dashed pieces. */
  color: string
  dashed: boolean
  points: LngLatTuple[]
}

const EARTH_RADIUS_M = 6371000
// A con_milla point farther than this from every sin_milla point is
// "off the shared trunk" — part of the milla loop itself.
const MILLA_DIVERGENCE_M = 15
// The divergent run has to be at least this many points long to count as
// the real milla loop rather than GPS/sampling noise near the trunk.
const MILLA_MIN_RUN = 10
// A point within this distance of an already-drawn shape's polyline (by
// point-to-segment, not point-to-vertex — see classify() below) is
// considered already on-screen and gets skipped.
const OVERLAP_THRESHOLD_M = 10
// Runs shorter than this get folded into a neighboring run instead of
// drawn as their own tiny piece — without this, differing point density
// between shapes makes the covered/new classification flicker in and out
// of threshold along a shared road, fragmenting it into dozens of
// 1-2-point slivers instead of one clean line.
const DESPIKE_MIN_RUN = 6
const MILLA_COLOR_BLEND = 0.35

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function haversineMeters(a: LngLatTuple, b: LngLatTuple): number {
  const [lon1, lat1] = a
  const [lon2, lat2] = b
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(s)))
}

/** Local equirectangular projection to meters, around a point's own latitude — accurate enough at campus scale (~1km) for point-to-segment math. */
function toLocalMeters(point: LngLatTuple, refLat: number): LngLatTuple {
  const [lon, lat] = point
  return [toRad(lon) * Math.cos(toRad(refLat)) * EARTH_RADIUS_M, toRad(lat) * EARTH_RADIUS_M]
}

function distanceToSegmentMeters(p: LngLatTuple, a: LngLatTuple, b: LngLatTuple): number {
  const refLat = p[1]
  const [px, py] = toLocalMeters(p, refLat)
  const [ax, ay] = toLocalMeters(a, refLat)
  const [bx, by] = toLocalMeters(b, refLat)
  const abx = bx - ax
  const aby = by - ay
  const lenSq = abx * abx + aby * aby
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lenSq))
  return Math.hypot(px - (ax + t * abx), py - (ay + t * aby))
}

function nearestPointDistance(p: LngLatTuple, points: LngLatTuple[]): number {
  let min = Infinity
  for (const q of points) min = Math.min(min, haversineMeters(p, q))
  return min
}

function nearestSegmentDistance(p: LngLatTuple, polylines: LngLatTuple[][]): number {
  let min = Infinity
  for (const points of polylines) {
    for (let i = 0; i < points.length - 1; i++) {
      min = Math.min(min, distanceToSegmentMeters(p, points[i]!, points[i + 1]!))
      if (min <= 0) return 0
    }
  }
  return min
}

/** Longest contiguous divergent run in millaPoints (vs. sinMillaPoints), extended by 1pt each side — or null if none clears MILLA_MIN_RUN. */
function findMillaRange(millaPoints: LngLatTuple[], sinMillaPoints: LngLatTuple[]): [number, number] | null {
  let bestStart = -1
  let bestLen = 0
  let runStart = -1
  for (let i = 0; i <= millaPoints.length; i++) {
    const divergent = i < millaPoints.length && nearestPointDistance(millaPoints[i]!, sinMillaPoints) > MILLA_DIVERGENCE_M
    if (divergent) {
      if (runStart === -1) runStart = i
    } else if (runStart !== -1) {
      const len = i - runStart
      if (len > bestLen) {
        bestLen = len
        bestStart = runStart
      }
      runStart = -1
    }
  }
  if (bestLen < MILLA_MIN_RUN) return null
  return [Math.max(0, bestStart - 1), Math.min(millaPoints.length - 1, bestStart + bestLen)]
}

type Label = 'dashed' | 'covered' | 'new'

function classify(points: LngLatTuple[], priorPolylines: LngLatTuple[][], millaRange: [number, number] | null): Label[] {
  return points.map((p, i) => {
    if (millaRange && i >= millaRange[0] && i <= millaRange[1]) return 'dashed'
    if (priorPolylines.length === 0) return 'new'
    return nearestSegmentDistance(p, priorPolylines) <= OVERLAP_THRESHOLD_M ? 'covered' : 'new'
  })
}

interface Run { label: Label, start: number, end: number }

function toRuns(labels: Label[]): Run[] {
  const runs: Run[] = []
  let start = 0
  for (let i = 1; i <= labels.length; i++) {
    if (i === labels.length || labels[i] !== labels[start]) {
      runs.push({ label: labels[start]!, start, end: i - 1 })
      start = i
    }
  }
  return runs
}

function mergeAdjacentRuns(runs: Run[]): Run[] {
  const merged: Run[] = []
  for (const run of runs) {
    const last = merged[merged.length - 1]
    if (last && last.label === run.label) last.end = run.end
    else merged.push({ ...run })
  }
  return merged
}

/** Folds covered/new runs shorter than DESPIKE_MIN_RUN into a neighboring run's classification. Never touches dashed runs — the milla range is geometrically fixed, not a product of overlap flicker. */
function despike(labels: Label[]): Label[] {
  let runs = toRuns(labels)
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < runs.length; i++) {
      const run = runs[i]!
      if (run.label === 'dashed' || run.end - run.start + 1 >= DESPIKE_MIN_RUN) continue
      const left = runs[i - 1]
      const right = runs[i + 1]
      const candidates = [left, right].filter((r): r is Run => !!r && r.label !== 'dashed')
      if (candidates.length === 0) continue
      const longer = candidates.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a))
      runs[i] = { ...run, label: longer.label }
      runs = mergeAdjacentRuns(runs)
      changed = true
      break
    }
  }
  const out: Label[] = new Array(labels.length)
  for (const run of runs) for (let i = run.start; i <= run.end; i++) out[i] = run.label
  return out
}

/** Contiguous non-covered runs, each extended by 1pt on either side (where available) so adjacent pieces connect with no visual gap. */
function buildPieces(points: LngLatTuple[], labels: Label[]): { dashed: boolean, points: LngLatTuple[] }[] {
  return toRuns(labels)
    .filter(run => run.label !== 'covered')
    .map(run => ({
      dashed: run.label === 'dashed',
      points: points.slice(Math.max(0, run.start - 1), Math.min(points.length - 1, run.end + 1) + 1)
    }))
}

export function lightenHexColor(hex: string, amount = MILLA_COLOR_BLEND): string {
  const clean = hex.replace('#', '')
  const mix = (c: number) => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0')
  return [0, 2, 4].map(i => mix(Number.parseInt(clean.slice(i, i + 2), 16))).join('')
}

function shapePoints(route: GtfsRoute): LngLatTuple[] {
  return route.shape?.length ? route.shape : route.stops.map((s): LngLatTuple => [s.lon, s.lat])
}

/** route_id is `${gtfsRouteId}__${shapeId}` (see scheduleProvider.ts) — recover shapeId to match a con_milla shape to its sin_milla counterpart. */
function shapeIdOf(route: GtfsRoute): string {
  return route.route_id.split('__').slice(1).join('__')
}

/**
 * Builds the polylines to actually draw for a set of GtfsRoute patterns
 * (typically the 1-3 shapes shown for one sentido): milla loops isolated to
 * their own dashed sub-segment, overlapping stretches drawn once.
 *
 * Order matters — earlier shapes always draw in full (nothing precedes
 * them to be "covered" by), later shapes only draw what's new. Non-special
 * shapes go first, then the EDUFI short-turn variant, then the milla
 * variant, so the milla loop and the EDUFI divergence — the genuinely
 * interesting parts — are what ends up drawn on top rather than skipped.
 */
export function buildRouteSegments(routes: GtfsRoute[]): RouteSegment[] {
  const candidates = routes.filter(r => r.stops.length > 1)
  const byShapeId = new Map(candidates.map(r => [shapeIdOf(r), r]))

  const isEdufi = (r: GtfsRoute) => !!r.direction_destinations?.includes('EDUFI')
  const rank = (r: GtfsRoute) => (r.is_milla ? 2 : isEdufi(r) ? 1 : 0)
  const ordered = [...candidates].sort((a, b) => rank(a) - rank(b))

  const priorPolylines: LngLatTuple[][] = []
  const segments: RouteSegment[] = []

  for (const route of ordered) {
    const points = shapePoints(route)

    let millaRange: [number, number] | null = null
    if (route.is_milla) {
      const counterpart = byShapeId.get(shapeIdOf(route).replace('_con_milla', '_sin_milla'))
      const counterpartPoints = counterpart && shapePoints(counterpart)
      if (counterpartPoints?.length) millaRange = findMillaRange(points, counterpartPoints)
    }

    const labels = despike(classify(points, priorPolylines, millaRange))
    buildPieces(points, labels).forEach((piece, i) => {
      segments.push({
        id: `${route.route_id}__${i}`,
        routeId: route.route_id,
        color: piece.dashed ? lightenHexColor(route.route_color) : route.route_color,
        dashed: piece.dashed,
        points: piece.points
      })
    })

    priorPolylines.push(points)
  }

  return segments
}
