/**
 * Dry-run validation for the park import pipeline.
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env scripts/validate-parks.ts [search term]
 *
 * Examples:
 *   pnpm exec tsx --env-file=.env scripts/validate-parks.ts serra
 *   pnpm exec tsx --env-file=.env scripts/validate-parks.ts tiririca
 *   pnpm exec tsx --env-file=.env scripts/validate-parks.ts          # lists all
 */

// Re-uses the exact same logic as import-parks-overpass.ts — fetch, filter, dedup — but
// prints results instead of inserting. Keep both files in sync if you change the core logic.

const SEARCH = process.argv[2]?.toLowerCase() ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

type ParkEntry = {
  name: string
  description: string | null
  city: string
  latitude: number
  longitude: number
  category: string
  source: string
}

// ─── Overpass ─────────────────────────────────────────────────────────────────

const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]

const PARK_TYPES = [
  { key: 'leisure', value: 'park' },
  { key: 'leisure', value: 'nature_reserve' },
  { key: 'leisure', value: 'garden' },
  { key: 'boundary', value: 'national_park' },
  { key: 'boundary', value: 'protected_area' },
  { key: 'landuse', value: 'recreation_ground' },
  { key: 'natural', value: 'wood' },
] as const

const BLOCKLIST_PATTERNS = [
  /\baeronáutica\b/i,
  /\bbase\s+(aérea|naval|militar)\b/i,
  /\bcomplexo\s+industrial\b/i,
  /\bindústria\b/i,
  /\bloteamento\b/i,
  /\bcondomín/i,
  /\bsítio\s+histórico\b/i,
  /^pico\s/i,
  /\bzona\s+de\s+amortecimento\b/i,
  /\bcorredor\s+ecológico\b/i,
  /\bfazenda\b/i,
  /\bsítio\b/i,
  /\bchácara\b/i,
  /\bcapoeira\b/i,
  /\bvegetação\b/i,
  /\bbioma\b/i,
  /\batlântica\b/i,
]

interface OsmTags {
  name?: string
  'name:pt'?: string
  'name:en'?: string
  description?: string
  'description:pt'?: string
  'addr:city'?: string
  'is_in:city'?: string
  is_in?: string
  leisure?: string
  boundary?: string
  landuse?: string
  natural?: string
  protect_class?: string
  [key: string]: string | undefined
}

interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: OsmTags
}

interface OverpassResponse {
  elements: OsmElement[]
}

function buildOverpassQuery(): string {
  const unions = PARK_TYPES.flatMap(({ key, value }) => [
    `  node["${key}"="${value}"](area.rj);`,
    `  way["${key}"="${value}"](area.rj);`,
    `  relation["${key}"="${value}"](area.rj);`,
  ]).join('\n')

  return `[out:json][timeout:90];
area["name"="Rio de Janeiro"]["boundary"="administrative"]["admin_level"="4"]->.rj;
(
${unions}
);
out tags center;`
}

function extractCategory(name: string, tags: OsmTags): string {
  if (tags.boundary === 'national_park') return 'national_park'
  if (tags.boundary === 'protected_area') {
    const pc = tags.protect_class ?? ''
    if (pc === '2') return /nacional/i.test(name) ? 'national_park' : 'park'
    if (pc === '5') return 'park'
    if (pc !== '') return 'nature_reserve'
    if (/parque\s+nacional/i.test(name)) return 'national_park'
    if (/parque\s+(estadual|municipal|natural|ecológico)/i.test(name)) return 'park'
    if (/\b(reserva|estação\s+ecológica|refúgio|monumento\s+natural|rppn)\b/i.test(name)) return 'nature_reserve'
    return 'park'
  }
  if (tags.leisure === 'nature_reserve') return 'nature_reserve'
  if (tags.leisure === 'garden') return 'garden'
  if (tags.landuse === 'recreation_ground') return 'recreation_ground'
  if (tags.natural === 'wood') {
    if (/parque\s+nacional/i.test(name)) return 'national_park'
    if (/parque\s+(estadual|municipal|natural|ecológico)/i.test(name)) return 'park'
    if (/\b(reserva|floresta|estação\s+ecológica|refúgio|apa\b)/i.test(name)) return 'nature_reserve'
    return 'park'
  }
  if (/\bpra[çc]a\b/i.test(name) || /\blargo\b/i.test(name)) return 'plaza'
  return 'park'
}

function extractCoords(el: OsmElement): [number, number] | null {
  if (el.type === 'node' && el.lat != null && el.lon != null) return [el.lat, el.lon]
  if (el.center) return [el.center.lat, el.center.lon]
  return null
}

function extractCity(tags: OsmTags): string {
  if (tags['addr:city']) return tags['addr:city']
  if (tags['is_in:city']) return tags['is_in:city']
  const isIn = tags.is_in
  if (isIn) {
    const first = isIn.split(',')[0].trim()
    if (first) return first
  }
  return 'Rio de Janeiro'
}

function isFalsePositive(name: string): boolean {
  return BLOCKLIST_PATTERNS.some((re) => re.test(name))
}

async function fetchFromOverpass(): Promise<ParkEntry[]> {
  const query = buildOverpassQuery()
  console.log('Querying Overpass...')

  let lastError: Error | null = null
  for (const mirror of OVERPASS_MIRRORS) {
    const res = await fetch(mirror, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'VisaoVerdeBot/1.0' },
      body: `data=${encodeURIComponent(query)}`,
    })
    if (!res.ok) {
      lastError = new Error(`HTTP ${res.status}`)
      continue
    }
    const data = (await res.json()) as OverpassResponse
    console.log(`  Raw elements: ${data.elements.length}`)

    const parks: ParkEntry[] = []
    let skippedNoName = 0
    let skippedNoCoords = 0
    let skippedBlocklist = 0

    for (const el of data.elements) {
      const tags = el.tags ?? {}
      const name = tags.name ?? tags['name:pt'] ?? tags['name:en'] ?? null
      if (!name) { skippedNoName++; continue }
      if (isFalsePositive(name)) { skippedBlocklist++; continue }
      const coords = extractCoords(el)
      if (!coords) { skippedNoCoords++; continue }
      parks.push({
        name,
        description: tags.description ?? tags['description:pt'] ?? null,
        city: extractCity(tags),
        latitude: coords[0],
        longitude: coords[1],
        category: extractCategory(name, tags),
        source: 'overpass',
      })
    }

    console.log(`  Skipped — no name: ${skippedNoName}, no coords: ${skippedNoCoords}, blocklist: ${skippedBlocklist}`)
    console.log(`  Overpass parks after filter: ${parks.length}`)
    return parks
  }

  throw lastError ?? new Error('All mirrors failed')
}

// ─── Dedup (same as import script) ───────────────────────────────────────────

const GRID_CELL_DEG = 0.0004

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function normalizeName(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function deduplicateParks(parks: ParkEntry[]): ParkEntry[] {
  const deduped: ParkEntry[] = []
  const nameIndex = new Map<string, number[]>()
  const grid = new Map<string, number[]>()

  function cellCoords(lat: number, lon: number): [number, number] {
    return [Math.floor(lat / GRID_CELL_DEG), Math.floor(lon / GRID_CELL_DEG)]
  }

  function registerEntry(idx: number, entry: ParkEntry): void {
    const norm = normalizeName(entry.name)
    const bucket = nameIndex.get(norm) ?? []
    bucket.push(idx)
    nameIndex.set(norm, bucket)
    const [cx, cy] = cellCoords(entry.latitude, entry.longitude)
    const cell = grid.get(`${cx},${cy}`) ?? []
    cell.push(idx)
    grid.set(`${cx},${cy}`, cell)
  }

  function unregisterEntry(idx: number, entry: ParkEntry): void {
    const norm = normalizeName(entry.name)
    const bucket = nameIndex.get(norm)?.filter((i) => i !== idx)
    if (bucket?.length) nameIndex.set(norm, bucket)
    else nameIndex.delete(norm)
    const [cx, cy] = cellCoords(entry.latitude, entry.longitude)
    const cell = grid.get(`${cx},${cy}`)?.filter((i) => i !== idx)
    if (cell?.length) grid.set(`${cx},${cy}`, cell)
    else grid.delete(`${cx},${cy}`)
  }

  function neighborCandidates(lat: number, lon: number): number[] {
    const [cx, cy] = cellCoords(lat, lon)
    const result: number[] = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cell = grid.get(`${cx + dx},${cy + dy}`)
        if (cell) result.push(...cell)
      }
    }
    return result
  }

  const SOURCE_PRIORITY: Record<string, number> = { manual: 5, datario: 4, icmbio: 3, inea: 2, overpass: 1 }

  function pickBetter(a: ParkEntry, b: ParkEntry): ParkEntry {
    const aDesc = a.description ? 1 : 0
    const bDesc = b.description ? 1 : 0
    if (aDesc !== bDesc) return aDesc > bDesc ? a : b
    const aPrio = SOURCE_PRIORITY[a.source] ?? 0
    const bPrio = SOURCE_PRIORITY[b.source] ?? 0
    if (aPrio !== bPrio) return aPrio > bPrio ? a : b
    return a.name.length >= b.name.length ? a : b
  }

  for (const entry of parks) {
    const { latitude, longitude } = entry
    const normalizedName = normalizeName(entry.name)

    const sameNameMatch = (nameIndex.get(normalizedName) ?? []).find(
      (i) => haversineMeters(deduped[i].latitude, deduped[i].longitude, latitude, longitude) <= 500,
    )
    if (sameNameMatch !== undefined) {
      const better = pickBetter(deduped[sameNameMatch], entry)
      if (better === entry) {
        unregisterEntry(sameNameMatch, deduped[sameNameMatch])
        deduped[sameNameMatch] = entry
        registerEntry(sameNameMatch, entry)
      }
      continue
    }

    const nearbyMatch = neighborCandidates(latitude, longitude).find(
      (i) => haversineMeters(deduped[i].latitude, deduped[i].longitude, latitude, longitude) <= 50,
    )
    if (nearbyMatch !== undefined) {
      const better = pickBetter(deduped[nearbyMatch], entry)
      if (better === entry) {
        unregisterEntry(nearbyMatch, deduped[nearbyMatch])
        deduped[nearbyMatch] = entry
        registerEntry(nearbyMatch, entry)
      }
      continue
    }

    registerEntry(deduped.length, entry)
    deduped.push(entry)
  }

  return deduped
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const overpassParks = await fetchFromOverpass()
  const deduped = deduplicateParks(overpassParks)

  console.log(`\nAfter dedup: ${deduped.length} parks`)

  const matches = SEARCH ? deduped.filter((p) => p.name.toLowerCase().includes(SEARCH)) : deduped

  if (SEARCH) {
    console.log(`\nSearch "${SEARCH}" → ${matches.length} result(s):\n`)
  } else {
    console.log(`\nAll parks (${matches.length}):\n`)
  }

  for (const p of matches) {
    console.log(`  [${p.category.padEnd(18)}] ${p.name}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
