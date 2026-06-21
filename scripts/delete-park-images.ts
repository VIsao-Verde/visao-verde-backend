/**
 * Delete all images inside the parks/ folder in Supabase Storage.
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env scripts/delete-park-images.ts
 */

import { supabase } from '@lib/supabase/index.js'

const BUCKET = 'park-images'
const ROOT_FOLDER = 'parks'

const PAGE_SIZE = 1000

async function listAll(bucket: string, folder: string) {
  const items = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: PAGE_SIZE, offset })

    if (error) throw error

    items.push(...data)

    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return items
}

async function deleteFolder(bucket: string, folder: string): Promise<void> {
  const data = await listAll(bucket, folder)

  const files: string[] = []

  for (const item of data) {
    const path = `${folder}/${item.name}`

    if (item.id) {
      files.push(path)
    } else {
      await deleteFolder(bucket, path)
    }
  }

  if (files.length > 0) {
    const { error: removeError } = await supabase.storage.from(bucket).remove(files)
    if (removeError) throw removeError
    console.log(`Deleted ${files.length} file(s) from ${folder}/`)
  }
}

console.log(`Deleting all images from ${BUCKET}/${ROOT_FOLDER}/ ...`)
await deleteFolder(BUCKET, ROOT_FOLDER)
console.log('Done.')
