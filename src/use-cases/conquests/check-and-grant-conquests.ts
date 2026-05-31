import { ConquestKey } from '@constants/conquest-keys.js'
import type { ConquestRepository } from '@repositories/conquests-repository.js'
import type { ReviewRepository } from '@repositories/reviews-repository.js'
import type { UserFavoriteParksRepository } from '@repositories/user-favorite-parks-repository.js'
import type { UserVisitedParksRepository } from '@repositories/user-visited-parks-repository.js'

interface CheckAndGrantConquestsUseCaseRequest {
  userId: string
}

export class CheckAndGrantConquestsUseCase {
  constructor(
    private conquestsRepository: ConquestRepository,
    private userVisitedParksRepository: UserVisitedParksRepository,
    private userFavoriteParksRepository: UserFavoriteParksRepository,
    private reviewsRepository: ReviewRepository,
  ) {}

  async execute({ userId }: CheckAndGrantConquestsUseCaseRequest): Promise<void> {
    const [allConquests, earnedIds] = await Promise.all([
      this.conquestsRepository.findAll(),
      this.conquestsRepository.findAllEarnedByUserId(userId),
    ])

    const earnedSet = new Set(earnedIds)
    const unearnedConquests = allConquests.filter((c) => !earnedSet.has(c.id))

    if (unearnedConquests.length === 0) return

    const needsVisitCount = unearnedConquests.some((c) =>
      [
        ConquestKey.FIRST_VISIT,
        ConquestKey.VISITED_5_PARKS,
        ConquestKey.VISITED_10_PARKS,
        ConquestKey.VISITED_25_PARKS,
        ConquestKey.ALL_ROUNDER,
      ].includes(c.key as ConquestKey),
    )
    const needsCityCount = unearnedConquests.some((c) => c.key === ConquestKey.VISITED_3_CITIES)
    const needsFavoriteCount = unearnedConquests.some((c) =>
      [ConquestKey.FIRST_FAVORITE, ConquestKey.FAVORITED_5_PARKS, ConquestKey.ALL_ROUNDER].includes(
        c.key as ConquestKey,
      ),
    )
    const needsReviewCount = unearnedConquests.some((c) =>
      [ConquestKey.FIRST_REVIEW, ConquestKey.REVIEWED_5_PARKS, ConquestKey.ALL_ROUNDER].includes(
        c.key as ConquestKey,
      ),
    )

    const [visitCount, cityCount, favoriteCount, reviewCount] = await Promise.all([
      needsVisitCount ? this.userVisitedParksRepository.countByUserId(userId) : Promise.resolve(0),
      needsCityCount ? this.userVisitedParksRepository.countDistinctCitiesByUserId(userId) : Promise.resolve(0),
      needsFavoriteCount ? this.userFavoriteParksRepository.countByUserId(userId) : Promise.resolve(0),
      needsReviewCount ? this.reviewsRepository.countByUserId(userId) : Promise.resolve(0),
    ])

    const RULES: Record<ConquestKey, () => boolean> = {
      [ConquestKey.FIRST_VISIT]: () => visitCount >= 1,
      [ConquestKey.VISITED_5_PARKS]: () => visitCount >= 5,
      [ConquestKey.VISITED_10_PARKS]: () => visitCount >= 10,
      [ConquestKey.VISITED_25_PARKS]: () => visitCount >= 25,
      [ConquestKey.FIRST_FAVORITE]: () => favoriteCount >= 1,
      [ConquestKey.FAVORITED_5_PARKS]: () => favoriteCount >= 5,
      [ConquestKey.FIRST_REVIEW]: () => reviewCount >= 1,
      [ConquestKey.REVIEWED_5_PARKS]: () => reviewCount >= 5,
      [ConquestKey.VISITED_3_CITIES]: () => cityCount >= 3,
      [ConquestKey.ALL_ROUNDER]: () => visitCount >= 5 && favoriteCount >= 3 && reviewCount >= 1,
    }

    const toGrant = unearnedConquests.filter((c) => {
      const rule = RULES[c.key as ConquestKey]
      return rule ? rule() : false
    })

    await Promise.all(toGrant.map((c) => this.conquestsRepository.assignToUser(userId, c.id)))
  }
}
