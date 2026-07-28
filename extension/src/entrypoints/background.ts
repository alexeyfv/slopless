import { SloplessApiInstance } from '@/services/SloplessApi'
import type { ArtistVerifyResult } from '../types/Messages'
import { onMessage } from '@/messaging'
import { DEFAULT_STRICT_TRACKS, extensionStorage } from '@/storage'

let lastResult: ArtistVerifyResult[] | null = null

export default defineBackground(() => {
  onMessage('artistFound', async message => {
    lastResult = await Promise.all(
      message.data.map(async req => {
        const id = req.artistId
        const result = await SloplessApiInstance.checkArtist(id)
        return {
          artistId: id,
          ai: result !== null && result.ai,
          aiTracks: result?.aiTracks ?? 0,
          totalTracks: result?.totalTracks ?? 0,
          name: result?.name ?? ''
        }
      })
    )

    return lastResult
  })

  onMessage('trackFound', async message => {
    return await Promise.all(
      message.data.map(async req => {
        const result = await SloplessApiInstance.checkTrack(req.trackId)
        return {
          trackId: req.trackId,
          ai: result !== null && result.ai,
          score: result?.score ?? null
        }
      })
    )
  })

  onMessage('getLatestArtist', () => {
    return lastResult
  })

  onMessage('getCounts', async () => {
    const stats = await SloplessApiInstance.getHomeStats()
    return {
      aiArtistsCount: stats.aiArtistsCount,
      totalArtistsCount: stats.totalArtistsCount,
      totalAiTracks: stats.totalAiTracks
    }
  })

  onMessage('checkAiStatus', async message => {
    const { artistIds, trackId } = message.data
    const strictTracks =
      (await extensionStorage.getItem('ai-action-strict-tracks')) ??
      DEFAULT_STRICT_TRACKS

    for (const id of artistIds) {
      const artist = await SloplessApiInstance.checkArtist(id)
      if (artist !== null && artist.ai) {
        if (!strictTracks || !trackId) return { ai: true }

        const track = await SloplessApiInstance.checkTrack(trackId)
        if (track !== null && track.ai) return { ai: true }
        return { ai: false }
      }
    }

    return { ai: false }
  })
})
