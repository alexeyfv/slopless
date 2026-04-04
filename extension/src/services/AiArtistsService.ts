import { extensionStorage } from '@/storage'

type AiArtistsResponse = {
  timestamp: string
  artists: number[]
}

class AiArtistsService {
  protected aiArtistIds: Set<string> = new Set()
  private readonly STORAGE_KEY = 'ai-artists'
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
  private readonly SOURCE_URL =
    'https://raw.githubusercontent.com/alexeyfv/slopless/refs/heads/main/data/yandex_music.json'
  private cacheCheckedAt = 0

  public async getAiArtists(): Promise<Set<string>> {
    const now = Date.now()
    const inMemoryTtl = now - this.cacheCheckedAt

    // Check in-memory cache first
    if (this.aiArtistIds.size > 0 && inMemoryTtl < this.CACHE_TTL_MS) {
      return this.aiArtistIds
    }

    const cached = await extensionStorage.getItem(this.STORAGE_KEY)

    // Check local storage cache
    if (cached && now - cached.checkedAt < this.CACHE_TTL_MS) {
      this.aiArtistIds = new Set(cached.artistIds)
      this.cacheCheckedAt = cached.checkedAt

      return this.aiArtistIds
    }

    // option 1 - cache is null
    // option 2 - cache is outdated
    // in any case, just update the cache
    const response = await fetch(this.SOURCE_URL)

    const jsonResponse = await response.json()
    const aiArtistsReponse = jsonResponse as AiArtistsResponse

    const remoteArtistIds = aiArtistsReponse.artists.map(artistId =>
      artistId.toString()
    )

    // Update local storage cache
    await extensionStorage.setItem(this.STORAGE_KEY, {
      timestamp: aiArtistsReponse.timestamp,
      artistIds: remoteArtistIds,
      checkedAt: now
    })

    // Update in-memory cache
    this.cacheCheckedAt = now
    this.aiArtistIds = new Set(remoteArtistIds)

    // Return the latest data
    return this.aiArtistIds
  }
}

export const AiArtistsServiceInstance = new AiArtistsService()
