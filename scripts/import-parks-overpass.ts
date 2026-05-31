import { prisma } from '@lib/prisma/index.js'

const RESET = process.argv.includes('--reset')

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

type PolygonCoords = number[][][]
type MultiPolygonCoords = number[][][][]

interface GeoJsonGeometry {
  type: 'Point' | 'Polygon' | 'MultiPolygon'
  coordinates: number[] | PolygonCoords | MultiPolygonCoords
}

interface GeoJsonFeature {
  type: 'Feature'
  properties: Record<string, unknown>
  geometry: GeoJsonGeometry | null
}

interface GeoJsonFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

// ─── Source priority (higher = wins dedup) ────────────────────────────────────

const SOURCE_PRIORITY: Record<string, number> = {
  manual: 5,
  datario: 4,
  icmbio: 3,
  inea: 2,
  overpass: 1,
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

// IUCN protect_class used by OSM Brazil:
//   1 = Reserva Natural Estrita / Área Silvestre      → nature_reserve
//   2 = Parque Nacional/Estadual/Municipal             → national_park or park
//   3 = Monumento Natural                              → nature_reserve
//   4 = Refúgio de Vida Silvestre                      → nature_reserve
//   5 = Paisagem Protegida                             → park
//   6 = APA / Floresta / RPPN (uso sustentável)        → nature_reserve
function extractCategory(name: string, tags: OsmTags): string {
  if (tags.boundary === 'national_park') return 'national_park'
  if (tags.boundary === 'protected_area') {
    const pc = tags.protect_class ?? ''
    if (pc === '2') return /nacional/i.test(name) ? 'national_park' : 'park'
    if (pc === '5') return 'park'
    return 'nature_reserve'
  }
  if (tags.leisure === 'nature_reserve') return 'nature_reserve'
  if (tags.leisure === 'garden') return 'garden'
  if (tags.landuse === 'recreation_ground') return 'recreation_ground'
  if (/\bpra[çc]a\b/i.test(name) || /\blargo\b/i.test(name)) return 'plaza'
  return 'park'
}

function extractCoords(el: OsmElement): [number, number] | null {
  if (el.type === 'node' && el.lat != null && el.lon != null) {
    return [el.lat, el.lon]
  }
  if (el.center) {
    return [el.center.lat, el.center.lon]
  }
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

function extractName(tags: OsmTags): string | null {
  return tags.name ?? tags['name:pt'] ?? tags['name:en'] ?? null
}

function extractDescription(tags: OsmTags): string | null {
  return tags.description ?? tags['description:pt'] ?? null
}

function isFalsePositive(name: string): boolean {
  return BLOCKLIST_PATTERNS.some((re) => re.test(name))
}

async function fetchFromOverpass(): Promise<ParkEntry[]> {
  const query = buildOverpassQuery()
  console.log('Querying Overpass API for parks in Rio de Janeiro state...')

  let lastError: Error | null = null
  for (const mirror of OVERPASS_MIRRORS) {
    console.log(`  Trying mirror: ${mirror}`)
    const res = await fetch(mirror, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VisaoVerdeBot/1.0',
        Accept: 'application/json, */*',
      },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!res.ok) {
      lastError = new Error(`Overpass HTTP ${res.status} from ${mirror}`)
      console.log(`  Failed (${res.status}), trying next mirror...`)
      continue
    }

    const data = (await res.json()) as OverpassResponse
    console.log(`  Raw elements received: ${data.elements.length}`)

    const parks: ParkEntry[] = []
    for (const el of data.elements) {
      const tags = el.tags ?? {}
      const name = extractName(tags)
      if (!name) continue
      if (isFalsePositive(name)) {
        console.log(`  [overpass] Skipping false positive: "${name}"`)
        continue
      }
      const coords = extractCoords(el)
      if (!coords) continue
      const [latitude, longitude] = coords
      parks.push({
        name,
        description: extractDescription(tags),
        city: extractCity(tags),
        latitude,
        longitude,
        category: extractCategory(name, tags),
        source: 'overpass',
      })
    }

    console.log(`  Overpass: ${parks.length} parks parsed`)
    return parks
  }

  throw lastError ?? new Error('All Overpass mirrors failed')
}

// ─── DataRio ──────────────────────────────────────────────────────────────────

const DATARIO_URL =
  'https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Urbanismo/LBB_Areas_Protegidas/FeatureServer/0/query'
const PAGE_SIZE = 100

interface ArcGISFeature {
  type: 'Feature'
  properties: {
    nome: string | null
    tipo: string | null
    observacao: string | null
    orgao: string | null
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: PolygonCoords | MultiPolygonCoords
  } | null
}

interface ArcGISResponse {
  features: ArcGISFeature[]
  exceededTransferLimit?: boolean
}

function computeCentroid(geometry: GeoJsonGeometry | ArcGISFeature['geometry']): [number, number] | null {
  if (!geometry) return null

  if (geometry.type === 'Point') {
    const [lon, lat] = geometry.coordinates as number[]
    return [lon, lat]
  }

  let ring: number[][]

  if (geometry.type === 'Polygon') {
    ring = (geometry.coordinates as PolygonCoords)[0]
  } else {
    ring = (geometry.coordinates as MultiPolygonCoords)
      .map((p) => p[0])
      .reduce((a, b) => (a.length >= b.length ? a : b))
  }

  if (!ring || ring.length === 0) return null

  const lon = ring.reduce((sum, c) => sum + c[0], 0) / ring.length
  const lat = ring.reduce((sum, c) => sum + c[1], 0) / ring.length
  return [lon, lat]
}

function extractDatarioCategory(name: string, tipo: string | null): string {
  const t = tipo?.toLowerCase() ?? ''
  const n = name.toLowerCase()
  if (t.includes('parque nacional')) return 'national_park'
  if (t.includes('reserva') || t.includes('unidade de conservação') || t.includes('apa')) return 'nature_reserve'
  if (t.includes('jardim')) return 'garden'
  if (n.includes('praça') || n.includes('largo') || t.includes('praça')) return 'plaza'
  return 'park'
}

async function fetchFromDatario(): Promise<ParkEntry[]> {
  console.log('Fetching parks from DataRio ArcGIS FeatureServer...')
  try {
    const all: ArcGISFeature[] = []
    let offset = 0

    while (true) {
      const params = new URLSearchParams({
        where: '1=1',
        outFields: 'nome,tipo,observacao,orgao',
        resultOffset: String(offset),
        resultRecordCount: String(PAGE_SIZE),
        f: 'geojson',
      })

      const res = await fetch(`${DATARIO_URL}?${params}`)
      if (!res.ok) throw new Error(`DataRio HTTP ${res.status} at offset ${offset}`)

      const data = (await res.json()) as ArcGISResponse
      all.push(...data.features)
      console.log(`  Fetched ${all.length} DataRio features (offset ${offset})`)

      if (!data.exceededTransferLimit) break
      offset += PAGE_SIZE
    }

    const seenNames = new Set<string>()
    const parks: ParkEntry[] = []

    for (const feature of all) {
      const rawNome = feature.properties.nome?.trim() ?? ''
      const tipo = feature.properties.tipo?.trim() || null
      const observacao = feature.properties.observacao?.trim() || null

      if (!rawNome) continue

      const name = /^[a-z]/.test(rawNome) && tipo ? `${tipo} ${rawNome}` : rawNome
      const key = name.toLowerCase()
      if (seenNames.has(key)) continue
      seenNames.add(key)

      if (!feature.geometry) continue
      const centroid = computeCentroid(feature.geometry)
      if (!centroid) continue
      const [longitude, latitude] = centroid

      const isSuffix = /^[a-z]/.test(rawNome)
      const description = [isSuffix ? null : tipo, observacao].filter(Boolean).join(' — ') || null

      parks.push({
        name,
        description,
        city: 'Rio de Janeiro',
        latitude,
        longitude,
        category: extractDatarioCategory(name, tipo),
        source: 'datario',
      })
    }

    console.log(`  DataRio: ${parks.length} parks parsed`)
    return parks
  } catch (err) {
    console.warn(`  DataRio fetch failed: ${err instanceof Error ? err.message : err}`)
    return []
  }
}

// ─── ICMBio (SNUC federal) ────────────────────────────────────────────────────

const ICMBIO_WFS = 'https://geodados.mma.gov.br/geoserver/wfs'

function extractIcmbioCategory(categoria: string): string {
  const c = categoria.toLowerCase()
  if (c.includes('parque nacional')) return 'national_park'
  if (c.includes('reserva') || c.includes('estação ecológica') || c.includes('refúgio')) return 'nature_reserve'
  return 'park'
}

async function fetchFromICMBio(): Promise<ParkEntry[]> {
  console.log('Fetching parks from ICMBio SNUC WFS...')
  try {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeNames: 'SNUC:uc_fed_todas',
      outputFormat: 'application/json',
      CQL_FILTER: "estados LIKE '%Rio de Janeiro%'",
    })

    const res = await fetch(`${ICMBIO_WFS}?${params}`, {
      headers: { 'User-Agent': 'VisaoVerdeBot/1.0' },
    })
    if (!res.ok) throw new Error(`ICMBio WFS HTTP ${res.status}`)

    const data = (await res.json()) as GeoJsonFeatureCollection
    if (!Array.isArray(data.features)) throw new Error('ICMBio response has no features array')

    const parks: ParkEntry[] = []

    for (const feature of data.features) {
      const props = feature.properties ?? {}

      const name =
        (props.nome_uc as string | null) ??
        (props.nome as string | null) ??
        (props.name as string | null)
      if (!name?.trim()) continue

      const categoriaRaw =
        (props.categoria_uc as string | null) ??
        (props.categoria as string | null) ??
        ''

      if (!feature.geometry) continue
      const centroid = computeCentroid(feature.geometry)
      if (!centroid) continue
      const [longitude, latitude] = centroid

      parks.push({
        name: name.trim(),
        description: null,
        city: 'Rio de Janeiro',
        latitude,
        longitude,
        category: extractIcmbioCategory(categoriaRaw),
        source: 'icmbio',
      })
    }

    console.log(`  ICMBio: ${parks.length} parks parsed`)
    return parks
  } catch (err) {
    console.warn(`  ICMBio fetch failed: ${err instanceof Error ? err.message : err}`)
    return []
  }
}

// ─── INEA (unidades de conservação estaduais RJ) ──────────────────────────────

const INEA_WFS = 'https://geoambiente.inea.rj.gov.br/geoserver/wfs'

function extractIneaCategory(categoria: string): string {
  const c = categoria.toLowerCase()
  if (c.includes('parque')) return c.includes('nacional') ? 'national_park' : 'park'
  if (c.includes('reserva') || c.includes('estação ecológica') || c.includes('apa')) return 'nature_reserve'
  return 'park'
}

async function fetchFromINEA(): Promise<ParkEntry[]> {
  console.log('Fetching parks from INEA WFS...')
  try {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeNames: 'INEA:unidades_conservacao',
      outputFormat: 'application/json',
    })

    const res = await fetch(`${INEA_WFS}?${params}`, {
      headers: { 'User-Agent': 'VisaoVerdeBot/1.0' },
    })
    if (!res.ok) throw new Error(`INEA WFS HTTP ${res.status}`)

    const data = (await res.json()) as GeoJsonFeatureCollection
    if (!Array.isArray(data.features)) throw new Error('INEA response has no features array')

    const parks: ParkEntry[] = []

    for (const feature of data.features) {
      const props = feature.properties ?? {}

      const name =
        (props.nome as string | null) ??
        (props.nome_uc as string | null) ??
        (props.name as string | null)
      if (!name?.trim()) continue

      const categoriaRaw = (props.categoria as string | null) ?? (props.categoria_uc as string | null) ?? ''

      if (!feature.geometry) continue
      const centroid = computeCentroid(feature.geometry)
      if (!centroid) continue
      const [longitude, latitude] = centroid

      parks.push({
        name: name.trim(),
        description: null,
        city: 'Rio de Janeiro',
        latitude,
        longitude,
        category: extractIneaCategory(categoriaRaw),
        source: 'inea',
      })
    }

    console.log(`  INEA: ${parks.length} parks parsed`)
    return parks
  } catch (err) {
    console.warn(`  INEA fetch failed: ${err instanceof Error ? err.message : err}`)
    return []
  }
}

// ─── Deduplication ────────────────────────────────────────────────────────────

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
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function pickBetter(a: ParkEntry, b: ParkEntry): ParkEntry {
  // 1. Prefer the one with a description
  const aDesc = a.description ? 1 : 0
  const bDesc = b.description ? 1 : 0
  if (aDesc !== bDesc) return aDesc > bDesc ? a : b
  // 2. Prefer higher-priority source
  const aPrio = SOURCE_PRIORITY[a.source] ?? 0
  const bPrio = SOURCE_PRIORITY[b.source] ?? 0
  if (aPrio !== bPrio) return aPrio > bPrio ? a : b
  // 3. Prefer longer name
  return a.name.length >= b.name.length ? a : b
}

// ~44 m per cell — 3×3 neighbourhood covers ±88 m, safely catching all ≤50 m pairs
const GRID_CELL_DEG = 0.0004

function deduplicateParks(parks: ParkEntry[]): ParkEntry[] {
  const deduped: ParkEntry[] = []
  // normalizedName → indices in deduped (multiple parks can share a name in different cities)
  const nameIndex = new Map<string, number[]>()
  // "cx,cy" → indices in deduped
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
    const key = `${cx},${cy}`
    const cell = grid.get(key) ?? []
    cell.push(idx)
    grid.set(key, cell)
  }

  function unregisterEntry(idx: number, entry: ParkEntry): void {
    const norm = normalizeName(entry.name)
    const bucket = nameIndex.get(norm)?.filter((i) => i !== idx)
    if (bucket?.length) nameIndex.set(norm, bucket)
    else nameIndex.delete(norm)

    const [cx, cy] = cellCoords(entry.latitude, entry.longitude)
    const key = `${cx},${cy}`
    const cell = grid.get(key)?.filter((i) => i !== idx)
    if (cell?.length) grid.set(key, cell)
    else grid.delete(key)
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

  for (const entry of parks) {
    const { latitude, longitude } = entry
    const normalizedName = normalizeName(entry.name)

    // Rule 1: same name within 500 m
    const sameNameMatch = (nameIndex.get(normalizedName) ?? []).find(
      (i) => haversineMeters(deduped[i].latitude, deduped[i].longitude, latitude, longitude) <= 500,
    )
    if (sameNameMatch !== undefined) {
      const existing = deduped[sameNameMatch]
      const better = pickBetter(existing, entry)
      if (better === entry) {
        console.log(`  Replacing "${existing.name}" [${existing.source}] with "${entry.name}" [${entry.source}] (same name, better info)`)
        unregisterEntry(sameNameMatch, existing)
        deduped[sameNameMatch] = entry
        registerEntry(sameNameMatch, entry)
      }
      continue
    }

    // Rule 2: different name within 50 m
    const nearbyMatch = neighborCandidates(latitude, longitude).find(
      (i) => haversineMeters(deduped[i].latitude, deduped[i].longitude, latitude, longitude) <= 50,
    )
    if (nearbyMatch !== undefined) {
      const existing = deduped[nearbyMatch]
      const better = pickBetter(existing, entry)
      if (better === entry) {
        console.log(`  Replacing "${existing.name}" [${existing.source}] with "${entry.name}" [${entry.source}] (nearby, better info)`)
        unregisterEntry(nearbyMatch, existing)
        deduped[nearbyMatch] = entry
        registerEntry(nearbyMatch, entry)
      }
      continue
    }

    // Unique park
    registerEntry(deduped.length, entry)
    deduped.push(entry)
  }

  return deduped
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (RESET) {
    console.log('--reset flag detected. Deleting all parks and related data...')
    const [reviews, trails, images, parks] = await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.trail.deleteMany(),
      prisma.image.deleteMany(),
      prisma.park.deleteMany(),
    ])
    console.log(`Deleted: ${parks.count} parks, ${reviews.count} reviews, ${trails.count} trails, ${images.count} images.\n`)
  }

  const [overpassResult, datarioResult, icmbioResult, ineaResult] = await Promise.allSettled([
    fetchFromOverpass(),
    fetchFromDatario(),
    fetchFromICMBio(),
    fetchFromINEA(),
  ])

  function settled(label: string, result: PromiseSettledResult<ParkEntry[]>): ParkEntry[] {
    if (result.status === 'fulfilled') return result.value
    console.warn(`${label} source failed: ${result.reason}`)
    return []
  }

  const allParks: ParkEntry[] = [
    ...settled('Overpass', overpassResult),
    ...settled('DataRio', datarioResult),
    ...settled('ICMBio', icmbioResult),
    ...settled('INEA', ineaResult),
  ]

  console.log(`\nTotal raw (pre-dedup): ${allParks.length}`)

  const deduped = deduplicateParks(allParks)

  console.log(`After dedup: ${deduped.length}`)

  if (deduped.length === 0) {
    console.log('Nothing to insert.')
    return
  }

  const names = deduped.map((p) => p.name)
  const descriptions = deduped.map((p) => p.description)
  const cities = deduped.map((p) => p.city)
  const latitudes = deduped.map((p) => p.latitude)
  const longitudes = deduped.map((p) => p.longitude)
  const categories = deduped.map((p) => p.category)
  const sources = deduped.map((p) => p.source)

  const inserted = await prisma.$executeRaw`
    INSERT INTO parks (id, name, description, city, latitude, longitude, location, category, source, created_at, updated_at)
    SELECT
      gen_random_uuid(),
      u.name,
      u.description,
      u.city,
      u.latitude,
      u.longitude,
      ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)::geography,
      u.category::"ParkCategory",
      u.source::"ParkSource",
      NOW(),
      NOW()
    FROM unnest(
      ${names}::text[],
      ${descriptions}::text[],
      ${cities}::text[],
      ${latitudes}::float8[],
      ${longitudes}::float8[],
      ${categories}::text[],
      ${sources}::text[]
    ) AS u(name, description, city, latitude, longitude, category, source)
    ON CONFLICT DO NOTHING
  `

  console.log(`\nDone. Inserted ${inserted} parks.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
