import { defineExtensionStorage } from '@webext-core/storage'

export type AiArtistsCache = {
  timestamp: string
  artistIds: string[]
  checkedAt: number
}

export type ExtensionStorageSchema = {
  'ai-artists': AiArtistsCache
  'processed-ai-artists': string[]
}

export const extensionStorage = defineExtensionStorage<ExtensionStorageSchema>(
  browser.storage.local
)
