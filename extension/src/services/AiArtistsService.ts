import { extensionStorage } from '@/storage'

type AiArtistsResponse = {
  deezer: {
    artists: number[]
    artists_100: number[]
    albums: number[]
    tracks: number[]
  }
  slopless: number[]
}

class AiArtistsService {
  private deezerArtists: Int32Array | null = null
  private deezerArtists100: Int32Array | null = null
  private deezerAlbums: Int32Array | null = null
  private deezerTracks: Int32Array | null = null
  private sloplessArtists: Int32Array | null = null

  private readonly STORAGE_KEY = 'ai-artists'
  // 1 day
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000
  private readonly SOURCE_URL =
    'https://raw.githubusercontent.com/alexeyfv/slopless/refs/heads/main/data/v0.2.0.json.gz'

  private cacheCheckedAt = 0
  private loading: Promise<void> | null = null

  private async ensureLoaded(): Promise<void> {
    const now = Date.now()

    if (this.deezerArtists && now - this.cacheCheckedAt < this.CACHE_TTL_MS) {
      return
    }

    if (this.loading) {
      await this.loading
      return
    }

    this.loading = (async () => {
      try {
        const response = await fetch(this.SOURCE_URL)
        const stream = response.body!.pipeThrough(
          new DecompressionStream('gzip')
        )
        const buffer = await new Response(stream).arrayBuffer()
        const json = JSON.parse(
          new TextDecoder().decode(buffer)
        ) as AiArtistsResponse

        this.deezerArtists = new Int32Array(json.deezer.artists)
        this.deezerArtists100 = new Int32Array(json.deezer.artists_100)
        this.deezerAlbums = new Int32Array(json.deezer.albums)
        this.deezerTracks = new Int32Array(json.deezer.tracks)
        this.sloplessArtists = new Int32Array(json.slopless)
        this.cacheCheckedAt = Date.now()

        await extensionStorage.setItem(this.STORAGE_KEY, {
          checkedAt: this.cacheCheckedAt
        })
      } finally {
        this.loading = null
      }
    })()

    await this.loading
  }

  private static binarySearch(arr: Int32Array, id: number): boolean {
    let lo = 0
    let hi = arr.length - 1

    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const val = arr[mid]

      if (val === id) return true
      if (val < id) lo = mid + 1
      else hi = mid - 1
    }

    return false
  }

  public async hasTrack(trackId: number): Promise<boolean> {
    await this.ensureLoaded()
    return AiArtistsService.binarySearch(this.deezerTracks!, trackId)
  }

  public async hasAlbum(albumId: number): Promise<boolean> {
    await this.ensureLoaded()
    return AiArtistsService.binarySearch(this.deezerAlbums!, albumId)
  }

  public async hasDeezerArtist(artistId: string): Promise<boolean> {
    await this.ensureLoaded()
    return (
      AiArtistsService.binarySearch(this.deezerArtists!, Number(artistId)) ||
      AiArtistsService.binarySearch(this.deezerArtists100!, Number(artistId))
    )
  }

  public async hasDeezerArtist100(artistId: string): Promise<boolean> {
    await this.ensureLoaded()
    return AiArtistsService.binarySearch(
      this.deezerArtists100!,
      Number(artistId)
    )
  }

  public async hasSlopless(artistId: string): Promise<boolean> {
    await this.ensureLoaded()
    return AiArtistsService.binarySearch(
      this.sloplessArtists!,
      Number(artistId)
    )
  }

  public async getArtistSource(
    artistId: string
  ): Promise<'deezer' | 'slopless' | null> {
    await this.ensureLoaded()
    if (
      AiArtistsService.binarySearch(this.deezerArtists!, Number(artistId)) ||
      AiArtistsService.binarySearch(this.deezerArtists100!, Number(artistId))
    )
      return 'deezer'
    if (AiArtistsService.binarySearch(this.sloplessArtists!, Number(artistId)))
      return 'slopless'
    return null
  }

  public async getTotalCount(): Promise<number> {
    await this.ensureLoaded()
    return (
      this.deezerArtists!.length +
      this.deezerArtists100!.length +
      this.sloplessArtists!.length
    )
  }

  public async getDeezerAllCount(): Promise<number> {
    await this.ensureLoaded()
    return this.deezerArtists!.length + this.deezerArtists100!.length
  }

  public async getDeezer100Count(): Promise<number> {
    await this.ensureLoaded()
    return this.deezerArtists100!.length
  }

  public async getSloplessCount(): Promise<number> {
    await this.ensureLoaded()
    return this.sloplessArtists!.length
  }
}

export const AiArtistsServiceInstance = new AiArtistsService()
