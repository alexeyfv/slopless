import { defineExtensionStorage } from '@webext-core/storage'

export type Locale = 'ru' | 'en'
export type AiMusicBehavior =
  | 'dislike'
  | 'dislike_if_not_liked'
  | 'skip'
  | 'skip_if_not_liked'
  | 'nothing'
  | 'like'

export const DEFAULT_BEHAVIOR: AiMusicBehavior = 'dislike'
export const DEFAULT_STRICT_TRACKS = false
export const DEFAULT_LOCALE: Locale = 'ru'
export const DEFAULT_SHOW_ARTIST_LABELS = true
export const DEFAULT_SHOW_TRACK_LABELS = true

export type ExtensionStorageSchema = {
  locale: Locale
  'ai-music-behavior': AiMusicBehavior
  'ai-action-strict-tracks': boolean
  'show-artist-labels': boolean
  'show-track-labels': boolean
}

export const extensionStorage = defineExtensionStorage<ExtensionStorageSchema>(
  browser.storage.local
)
