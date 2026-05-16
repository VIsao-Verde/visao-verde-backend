import { supabase } from '@lib/supabase/index.js'
import type { ParkRepository } from '@repositories/parks-repository.js'
import { ImageNotFoundError } from '../errors/image-not-found-error.js'
import { ParkNotFoundError } from '../errors/park-not-found-error.js'

interface DeleteParkImageUseCaseRequest {
  parkId: string
  imageId: string
}

export class DeleteParkImageUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ parkId, imageId }: DeleteParkImageUseCaseRequest) {
    const park = await this.parksRepository.findBy({ id: parkId })
    if (!park) throw new ParkNotFoundError()

    const images = await this.parksRepository.listImages(parkId)
    const image = images.find((img) => img.id === imageId)
    if (!image) throw new ImageNotFoundError()

    const storagePath = image.url.split('/public/park-images/')[1]
    await supabase.storage.from('park-images').remove([storagePath])

    await this.parksRepository.deleteImage(imageId)
  }
}
