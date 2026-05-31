import { prisma } from '@lib/prisma/index.js'

export type ReviewStats = { count: number; avg: number | null }

export async function getReviewStats(parkIds: string[]): Promise<Map<string, ReviewStats>> {
  if (parkIds.length === 0) return new Map()

  const rows = await prisma.$queryRaw<Array<{ park_id: string; count: bigint; avg: number | null }>>`
    SELECT
      park_id,
      COUNT(*) AS count,
      AVG(CASE rating
        WHEN 'one' THEN 1
        WHEN 'two' THEN 2
        WHEN 'three' THEN 3
        WHEN 'four' THEN 4
        WHEN 'five' THEN 5
      END) AS avg
    FROM reviews
    WHERE park_id = ANY(${parkIds}::text[])
    GROUP BY park_id
  `

  return new Map(
    rows.map((r) => [
      r.park_id,
      {
        count: Number(r.count),
        avg: r.avg !== null ? Math.round(Number(r.avg) * 10) / 10 : null,
      },
    ]),
  )
}
