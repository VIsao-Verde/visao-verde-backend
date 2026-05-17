import type { ReviewWithPark, ReviewWithUser } from '@repositories/reviews-repository.js'
import type { Review } from '@/@types/prisma/client.js'
import type { Rating } from '@/@types/prisma/enums.js'

const ratingToNumber: Record<Rating, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
}

type HTTPReview = {
  id: string
  rating: number
  comment: string | null
  userId: string
  parkId: string
  createdAt: Date
}

type HTTPReviewWithUser = Omit<HTTPReview, 'userId'> & {
  user: { id: string; name: string }
}

type HTTPReviewWithPark = Omit<HTTPReview, 'parkId'> & {
  park: { id: string; name: string; city: string }
}

export class ReviewPresenter {
  static toHTTP(review: Review): HTTPReview {
    return {
      id: review.id,
      rating: ratingToNumber[review.rating],
      comment: review.comment,
      userId: review.userId,
      parkId: review.parkId,
      createdAt: review.createdAt,
    }
  }

  static toHTTPWithUser(reviews: ReviewWithUser[]): HTTPReviewWithUser[] {
    return reviews.map((r) => ({
      id: r.id,
      rating: ratingToNumber[r.rating],
      comment: r.comment,
      parkId: r.parkId,
      createdAt: r.createdAt,
      user: { id: r.user.id, name: r.user.name },
    }))
  }

  static toHTTPWithPark(reviews: ReviewWithPark[]): HTTPReviewWithPark[] {
    return reviews.map((r) => ({
      id: r.id,
      rating: ratingToNumber[r.rating],
      comment: r.comment,
      userId: r.userId,
      createdAt: r.createdAt,
      park: { id: r.park.id, name: r.park.name, city: r.park.city },
    }))
  }
}
