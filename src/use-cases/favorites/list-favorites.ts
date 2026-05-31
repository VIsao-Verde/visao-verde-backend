import type {
  FavoriteParkWithDetails,
  UserFavoriteParksRepository,
} from '@repositories/user-favorite-parks-repository.js'

interface ListFavoritesUseCaseRequest {
  userId: string
  page: number
  limit: number
}

type ListFavoritesUseCaseResponse = {
  favorites: FavoriteParkWithDetails[]
  total: number
}

export class ListFavoritesUseCase {
  constructor(private userFavoriteParksRepository: UserFavoriteParksRepository) {}

  async execute({ userId, page, limit }: ListFavoritesUseCaseRequest): Promise<ListFavoritesUseCaseResponse> {
    return await this.userFavoriteParksRepository.list(userId, page, limit)
  }
}
