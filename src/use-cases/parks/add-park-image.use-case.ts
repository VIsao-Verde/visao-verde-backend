import { env } from '@env/index.js'
import { supabase } from '@lib/supabase/index.js'
import type { ParkRepository } from '@repositories/parks-repository.js'
import sharp from 'sharp'
import { v7 as uuidv7 } from 'uuid'
import { ImageUploadError } from '../errors/image-upload-error.js'
import { ParkNotFoundError } from '../errors/park-not-found-error.js'

interface AddParkImageUseCaseRequest {
  parkId: string
  buffer: Buffer
}

export class AddParkImageUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ parkId, buffer }: AddParkImageUseCaseRequest) {
    const park = await this.parksRepository.findBy({ id: parkId })
    if (!park) throw new ParkNotFoundError()

    const compressed = await sharp(buffer)
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    const storagePath = `parks/${parkId}/${uuidv7()}.webp`

    const { error } = await supabase.storage
      .from('park-images')
      .upload(storagePath, compressed, { contentType: 'image/webp', upsert: false })

    if (error) throw new ImageUploadError()

    const url = `${env.SUPABASE_URL}/storage/v1/object/public/park-images/${storagePath}`

    const image = await this.parksRepository.addImage(parkId, {
      url,
      park: { connect: { id: parkId } },
    })

    return { image }
  }
}
