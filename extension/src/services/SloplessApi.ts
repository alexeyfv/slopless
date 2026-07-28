import { LRUCache } from 'lru-cache'
import { API_BASE } from '@/types/Domains'

type CacheValue = Record<string, unknown>

const NOT_FOUND: CacheValue = Object.freeze({})

const AI_ARTIST_THRESHOLD = 0.05 // 5% of total tracks

class SloplessApi {
  private readonly cache = new LRUCache<string, CacheValue>({
    max: 10000,
    ttl: 60 * 60 * 1000
  })

  private readonly inflight = new Map<string, Promise<unknown>>()

  private async fetchWithDedup<T extends CacheValue>(
    key: string,
    url: string
  ): Promise<T | null> {
    const cached = this.cache.get(key)
    if (cached !== undefined) {
      if (cached === NOT_FOUND) return null
      return cached as T
    }

    const pending = this.inflight.get(key)
    if (pending) return (await pending) as T | null

    const promise = (async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) {
          this.cache.set(key, NOT_FOUND)
          return null
        }
        const data = (await res.json()) as CacheValue
        this.cache.set(key, data)
        return data as T
      } catch {
        this.cache.set(key, NOT_FOUND)
        return null
      } finally {
        this.inflight.delete(key)
      }
    })()

    this.inflight.set(key, promise)
    return promise
  }

  async checkArtist(artistId: string): Promise<{
    ai: boolean
    aiTracks: number
    totalTracks: number
    name: string
  } | null> {
    const data = await this.fetchWithDedup<{
      id: number
      name: string
      aiTracks: number
      totalTracks: number
    }>(`artist:${artistId}`, `${API_BASE}/api/artist/${artistId}`)

    if (!data) return null

    return {
      ai: data.totalTracks > 0
        ? data.aiTracks / data.totalTracks >= AI_ARTIST_THRESHOLD
        : false,
      aiTracks: data.aiTracks,
      totalTracks: data.totalTracks,
      name: data.name
    }
  }

  async checkTrack(trackId: string): Promise<{
    ai: boolean
    score: number | null
  } | null> {
    const data = await this.fetchWithDedup<{
      id: number
      score: number | null
    }>(`track:${trackId}`, `${API_BASE}/api/track/${trackId}`)

    if (!data) return null

    return {
      ai: data.score !== null && data.score > 0.5,
      score: data.score
    }
  }

  async getHomeStats(): Promise<{
    aiArtistsCount: number
    totalArtistsCount: number
    totalAiTracks: number
  }> {
    const data = await this.fetchWithDedup<{
      aiArtistsCount: number
      totalArtistsCount: number
      totalAiTracks: number
    }>('home', `${API_BASE}/api/home`)

    return data ?? { aiArtistsCount: 0, totalArtistsCount: 0, totalAiTracks: 0 }
  }
}

export const SloplessApiInstance = new SloplessApi()
