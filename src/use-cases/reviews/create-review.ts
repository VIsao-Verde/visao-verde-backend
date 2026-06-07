import { env } from '@env/index.js'
import { logError } from '@lib/logger/helpers.js'
import { supabase } from '@lib/supabase/index.js'
import type { ParkRepository } from '@repositories/parks-repository.js'
import type { ReviewData, ReviewRepository } from '@repositories/reviews-repository.js'
import type { CheckAndGrantConquestsUseCase } from '@use-cases/conquests/check-and-grant-conquests.js'
import { ImageUploadError } from '@use-cases/errors/image-upload-error.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'
import sharp from 'sharp'
import { v7 as uuidv7 } from 'uuid'
import type { Review } from '@/@types/prisma/client.js'

interface CreateReviewUseCaseRequest {
  userId: string
  parkId: string
  data: ReviewData
  imageBuffer?: Buffer
}

type CreateReviewUseCaseResponse = {
  review: Review
}

export class CreateReviewUseCase {
  constructor(
    private reviewsRepository: ReviewRepository,
    private parksRepository: ParkRepository,
    private checkAndGrantConquestsUseCase?: CheckAndGrantConquestsUseCase,
  ) {}

  async execute({ userId, parkId, data, imageBuffer }: CreateReviewUseCaseRequest): Promise<CreateReviewUseCaseResponse> {
    const park = await this.parksRepository.findBy({ id: parkId })

    if (!park) throw new ParkNotFoundError()

    let reviewData = data

    if (imageBuffer) {
      const reviewId = uuidv7()

      const compressed = await sharp(imageBuffer)
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()

      const storagePath = `reviews/${reviewId}/${uuidv7()}.webp`

      const { error } = await supabase.storage
        .from('park-images')
        .upload(storagePath, compressed, { contentType: 'image/webp', upsert: false })

      if (error) throw new ImageUploadError()

      const imageUrl = `${env.SUPABASE_URL}/storage/v1/object/public/park-images/${storagePath}`

      reviewData = { ...data, id: reviewId, imageUrl }
    }

    const review = await this.reviewsRepository.create(userId, parkId, reviewData)

    await this.checkAndGrantConquestsUseCase
      ?.execute({ userId })
      .catch((error) => logError(error, { userId }, 'Failed to check and grant conquests after review'))

    return { review }
  }
}
