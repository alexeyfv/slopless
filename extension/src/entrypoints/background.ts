import { SloplessApiInstance } from '@/services/SloplessApi'
import {
  decideArtist,
  decideTrack,
  shouldTakeAutomaticAction,
  type SourceSettings
} from '@/services/AiLabelingPolicy'
import type { ArtistData } from '@/types/Api'
import type { ArtistVerifyResult } from '../types/Messages'
import { onMessage } from '@/messaging'
import {
  DEFAULT_STRICT_TRACKS,
  DEFAULT_USE_SLOPLESS_LABELING,
  DEFAULT_USE_YANDEX_LABELING,
  extensionStorage
} from '@/storage'

async function getSourceSettings(): Promise<SourceSettings> {
  const useSlopless = await extensionStorage.getItem('use-slopless-labeling')
  const useYandex = await extensionStorage.getItem('use-yandex-labeling')

  return {
    useSlopless: useSlopless ?? DEFAULT_USE_SLOPLESS_LABELING,
    useYandex: useYandex ?? DEFAULT_USE_YANDEX_LABELING
  }
}

let lastResult: ArtistVerifyResult[] | null = null

export default defineBackground(() => {
  onMessage('artistFound', async message => {
    const { useSlopless, useYandex } = await getSourceSettings()

    lastResult = await Promise.all(
      message.data.map(async req => {
        const id = req.artistId
        const result = await SloplessApiInstance.getArtist(id)
        const decision = result
          ? decideArtist(result, { useSlopless, useYandex })
          : null
        return {
          artistId: id,
          ai: decision?.ai ?? false,
          aiTracks: result?.aiTracks ?? 0,
          totalTracks: result?.totalTracks ?? 0,
          yandexAiTracks: result?.yandexAiTracks ?? 0,
          yandexCheckedTracks: result?.yandexCheckedTracks ?? 0,
          yandexAiTrackList: result?.yandexAiTrackList ?? [],
          name: result?.name ?? ''
        }
      })
    )

    return lastResult
  })

  onMessage('trackFound', async message => {
    const { useSlopless, useYandex } = await getSourceSettings()

    return await Promise.all(
      message.data.map(async req => {
        const result = await SloplessApiInstance.getTrack(req.trackId)
        const decision = result
          ? decideTrack(result, { useSlopless, useYandex })
          : null
        return {
          trackId: req.trackId,
          ai: decision?.ai ?? false,
          score: result?.score ?? null,
          scoreYandex: result?.scoreYandex ?? null
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
    const { useSlopless, useYandex } = await getSourceSettings()
    const strictTracks =
      (await extensionStorage.getItem('ai-action-strict-tracks')) ??
      DEFAULT_STRICT_TRACKS

    const artists = (
      await Promise.all(artistIds.map(id => SloplessApiInstance.getArtist(id)))
    ).filter((artist): artist is ArtistData => artist !== null)
    const track = trackId ? await SloplessApiInstance.getTrack(trackId) : null

    return {
      ai: shouldTakeAutomaticAction(
        artists,
        track,
        { useSlopless, useYandex },
        strictTracks
      )
    }
  })
})
