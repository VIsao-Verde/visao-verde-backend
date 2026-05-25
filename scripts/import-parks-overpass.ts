import { prisma } from '@lib/prisma/index.js'

const RESET = process.argv.includes('--reset')

// ─── Overpass API ─────────────────────────────────────────────────────────────

const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]

/**
 * Tipos de parque buscados. Ajuste conforme necessário.
 * Referência de tags: https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dpark
 */
const PARK_TYPES = [
  { key: 'leisure', value: 'park' },
  { key: 'leisure', value: 'nature_reserve' },
  { key: 'boundary', value: 'national_park' },
] as const

/**
 * Nomes/palavras que indicam que o elemento NÃO é um parque de lazer/natureza.
 * Filtra falsos positivos comuns da Overpass (bairros, distritos industriais, etc.).
 */
const BLOCKLIST_PATTERNS = [
  /\baeronáutica\b/i,
  /\bbase\s+(aérea|naval|militar)\b/i,
  /\bcomplexo\s+industrial\b/i,
  /\bindústria\b/i,
  /\bloteamento\b/i,
  /\bcondomín/i,
  /\bsítio\s+histórico\b/i, // ex: bairros históricos — não parques
]

function buildOverpassQuery(): string {
  const unions = PARK_TYPES.flatMap(({ key, value }) => [
    `  node["${key}"="${value}"](area.rj);`,
    `  way["${key}"="${value}"](area.rj);`,
    `  relation["${key}"="${value}"](area.rj);`,
  ]).join('\n')

  // admin_level=4 = estado no Brasil (OSM)
  return `[out:json][timeout:90];
area["name"="Rio de Janeiro"]["boundary"="administrative"]["admin_level"="4"]->.rj;
(
${unions}
);
out tags center;`
}

// ─── Tipos OSM ────────────────────────────────────────────────────────────────

interface OsmTags {
  name?: string
  'name:pt'?: string
  'name:en'?: string
  description?: string
  'description:pt'?: string
  'addr:city'?: string
  'is_in:city'?: string
  is_in?: string
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function extractCoords(el: OsmElement): [number, number] | null {
  if (el.type === 'node' && el.lat != null && el.lon != null) {
    return [el.lat, el.lon]
  }
  if (el.center) {
    return [el.center.lat, el.center.lon]
  }
  return null
}

/**
 * Extrai cidade a partir das tags OSM.
 * A tag `is_in` costuma vir como "Niterói, Rio de Janeiro, Brasil".
 */
function extractCity(tags: OsmTags): string {
  if (tags['addr:city']) return tags['addr:city']
  if (tags['is_in:city']) return tags['is_in:city']

  const isIn = tags['is_in']
  if (isIn) {
    const first = isIn.split(',')[0].trim()
    if (first) return first
  }

  return 'Rio de Janeiro' // fallback: ao menos está no estado
}

function extractName(tags: OsmTags): string | null {
  return tags['name'] ?? tags['name:pt'] ?? tags['name:en'] ?? null
}

function extractDescription(tags: OsmTags): string | null {
  return tags['description'] ?? tags['description:pt'] ?? null
}

function isFalsePositive(name: string): boolean {
  return BLOCKLIST_PATTERNS.some((re) => re.test(name))
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchAllParks(): Promise<OsmElement[]> {
  const query = buildOverpassQuery()
  console.log('Querying Overpass API for parks in Rio de Janeiro state...')

  let lastError: Error | null = null
  for (const mirror of OVERPASS_MIRRORS) {
    console.log(`  Trying mirror: ${mirror}`)
    const res = await fetch(mirror, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'visao-verde-import/1.0',
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
    return data.elements
  }

  throw lastError ?? new Error('All Overpass mirrors failed')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (RESET) {
    console.log('--reset flag detected. Deleting all parks...')
    const deleted = await prisma.park.deleteMany()
    console.log(`Deleted ${deleted.count} parks.\n`)
  }

  const elements = await fetchAllParks()

  type ParkEntry = {
    name: string
    description: string | null
    city: string
    latitude: number
    longitude: number
  }

  // Prefer the park with a description; tiebreak by longer name.
  function pickBetter(a: ParkEntry, b: ParkEntry): ParkEntry {
    const aHasDesc = a.description ? 1 : 0
    const bHasDesc = b.description ? 1 : 0
    if (aHasDesc !== bHasDesc) return aHasDesc > bHasDesc ? a : b
    return a.name.length >= b.name.length ? a : b
  }

  const parks: ParkEntry[] = []

  for (const el of elements) {
    const tags = el.tags ?? {}

    const name = extractName(tags)
    if (!name) continue

    if (isFalsePositive(name)) {
      console.log(`  Skipping false positive: "${name}"`)
      continue
    }

    const coords = extractCoords(el)
    if (!coords) continue

    const [latitude, longitude] = coords
    const normalizedName = normalizeName(name)
    const entry: ParkEntry = {
      name,
      description: extractDescription(tags),
      city: extractCity(tags),
      latitude,
      longitude,
    }

    // Same name within 500 m → keep better one
    const sameNameIdx = parks.findIndex(
      (p) =>
        normalizeName(p.name) === normalizedName &&
        haversineMeters(p.latitude, p.longitude, latitude, longitude) <= 500,
    )
    if (sameNameIdx !== -1) {
      const better = pickBetter(parks[sameNameIdx], entry)
      if (better === entry) {
        console.log(`  Replacing "${parks[sameNameIdx].name}" with "${name}" (same name, better info)`)
        parks[sameNameIdx] = entry
      } else {
        console.log(`  Skipping duplicate (same name, ≤500 m): "${name}"`)
      }
      continue
    }

    // Different name within 50 m → keep better one
    const nearbyIdx = parks.findIndex(
      (p) => haversineMeters(p.latitude, p.longitude, latitude, longitude) <= 50,
    )
    if (nearbyIdx !== -1) {
      const better = pickBetter(parks[nearbyIdx], entry)
      if (better === entry) {
        console.log(`  Replacing "${parks[nearbyIdx].name}" with "${name}" (nearby, better info)`)
        parks[nearbyIdx] = entry
      } else {
        console.log(`  Skipping nearby (≤50 m): "${name}" vs "${parks[nearbyIdx].name}"`)
      }
      continue
    }

    parks.push(entry)
  }

  console.log(`Unique parks to insert: ${parks.length}`)

  // ── INSERT único via unnest ────────────────────────────────────────────────
  //
  // Envia todos os parques em uma única query ao Supabase, independente do
  // volume. O unnest descompacta os arrays em linhas antes do INSERT, e o
  // ST_MakePoint constrói o geography(Point,4326) direto de lat/lon —
  // sem nenhum round-trip extra.
  //
  // ON CONFLICT DO NOTHING evita erro se o script for rodado mais de uma vez
  // (precisaria de uma UNIQUE constraint em `name`, ou remova se preferir
  // deixar o banco rejeitar duplicatas de outra forma).

  const names = parks.map((p) => p.name)
  const descriptions = parks.map((p) => p.description) // pode conter nulls
  const cities = parks.map((p) => p.city)
  const latitudes = parks.map((p) => p.latitude)
  const longitudes = parks.map((p) => p.longitude)

  const inserted = await prisma.$executeRaw`
    INSERT INTO parks (id, name, description, city, latitude, longitude, location, created_at, updated_at)
    SELECT
      gen_random_uuid(),
      u.name,
      u.description,
      u.city,
      u.latitude,
      u.longitude,
      ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)::geography,
      NOW(),
      NOW()
    FROM unnest(
      ${names}::text[],
      ${descriptions}::text[],
      ${cities}::text[],
      ${latitudes}::float8[],
      ${longitudes}::float8[]
    ) AS u(name, description, city, latitude, longitude)
    ON CONFLICT DO NOTHING
  `

  console.log(`Done. Inserted ${inserted} parks.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())