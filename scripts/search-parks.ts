/**
 * Search parks in the database.
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env scripts/search-parks.ts <term>
 *
 * Examples:
 *   pnpm exec tsx --env-file=.env scripts/search-parks.ts serra
 *   pnpm exec tsx --env-file=.env scripts/search-parks.ts tiririca
 */

import { prisma } from '@lib/prisma/index.js'

const term = process.argv[2]

if (!term) {
  console.error('Usage: pnpm exec tsx --env-file=.env scripts/search-parks.ts <term>')
  process.exit(1)
}

const parks = await prisma.park.findMany({
  where: { name: { contains: term, mode: 'insensitive' } },
  select: { name: true, category: true, source: true, city: true },
  orderBy: { name: 'asc' },
})

if (parks.length === 0) {
  console.log(`No parks found matching "${term}".`)
} else {
  console.log(`Found ${parks.length} park(s) matching "${term}":\n`)
  for (const p of parks) {
    console.log(`  [${p.category.padEnd(18)}] [${p.source.padEnd(8)}] ${p.name} — ${p.city}`)
  }
}

await prisma.$disconnect()
