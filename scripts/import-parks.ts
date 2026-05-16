import { prisma } from '@lib/prisma/index.js'

const BASE_URL =
  'https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Urbanismo/LBB_Areas_Protegidas/FeatureServer/0/query'
const PAGE_SIZE = 100

type PolygonCoords = number[][][]
type MultiPolygonCoords = number[][][][]

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

function computeCentroid(feature: ArcGISFeature): [number, number] | null {
  if (!feature.geometry) return null

  let ring: number[][]

  if (feature.geometry.type === 'Polygon') {
    ring = (feature.geometry.coordinates as PolygonCoords)[0]
  } else {
    ring = (feature.geometry.coordinates as MultiPolygonCoords)
      .map((p) => p[0])
      .reduce((a, b) => (a.length >= b.length ? a : b))
  }

  if (!ring || ring.length === 0) return null

  const lon = ring.reduce((sum, c) => sum + c[0], 0) / ring.length
  const lat = ring.reduce((sum, c) => sum + c[1], 0) / ring.length
  return [lon, lat]
}

async function fetchAllFeatures(): Promise<ArcGISFeature[]> {
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

    const res = await fetch(`${BASE_URL}?${params}`)
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching offset ${offset}`)

    const data = (await res.json()) as ArcGISResponse
    all.push(...data.features)

    console.log(`  Fetched ${all.length} features so far (offset ${offset})`)

    if (!data.exceededTransferLimit) break
    offset += PAGE_SIZE
  }

  return all
}

async function main() {
  console.log('Fetching parks from DataRio ArcGIS FeatureServer...')
  const features = await fetchAllFeatures()
  console.log(`Total features fetched: ${features.length}`)

  const seenNames = new Set<string>()
  const parks: Array<{
    name: string
    description: string | null
    city: string
    latitude: number
    longitude: number
  }> = []

  for (const feature of features) {
    const name = feature.properties.nome?.trim()
    if (!name) continue

    const key = name.toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)

    const centroid = computeCentroid(feature)
    if (!centroid) continue

    const [longitude, latitude] = centroid

    const description =
      [feature.properties.tipo, feature.properties.observacao].filter(Boolean).join(' — ') || null

    parks.push({ name, description, city: 'Rio de Janeiro', latitude, longitude })
  }

  console.log(`Unique parks to insert: ${parks.length}`)

  const result = await prisma.park.createMany({ data: parks })
  console.log(`Done. Inserted ${result.count} parks.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

