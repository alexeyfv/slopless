import { defineExtensionStorage } from '@webext-core/storage'

export type AiArtistsCache = {
  checkedAt: number
}

// Level 1 (any) - Deezer (Any%) + Slopless AI detector
// Level 2 (deezer_any) - If at least 1 release is labeled as AI on Deezer (Any%)
// Level 3 (deezer_100) - If 100% of artist's releases are labeled as AI in Deezer
export type AiActionThreshold = 'any' | 'deezer_any' | 'deezer_100'
export type AiMusicBehavior =
  | 'dislike'
  | 'dislike_if_not_liked'
  | 'skip'
  | 'skip_if_not_liked'
  | 'nothing'
  | 'like'

export const DEFAULT_THRESHOLD: AiActionThreshold = 'any'
export const DEFAULT_BEHAVIOR: AiMusicBehavior = 'dislike'
export const DEFAULT_STRICT_TRACKS = false

export type ExtensionStorageSchema = {
  'ai-artists': AiArtistsCache
  'ai-music-behavior': AiMusicBehavior
  'ai-action-threshold': AiActionThreshold
  'ai-action-strict-tracks': boolean
}

export const extensionStorage = defineExtensionStorage<ExtensionStorageSchema>(
  browser.storage.local
)
