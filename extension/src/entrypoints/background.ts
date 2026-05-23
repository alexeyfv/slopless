import { AiArtistsServiceInstance } from '@/services/AiArtistsService'
import type { VerifyResult } from '../types/Messages'
import { onMessage } from '@/messaging'
import { DEFAULT_THRESHOLD, extensionStorage } from '@/storage'

let lastResult: VerifyResult[] | null = null

export default defineBackground(() => {
  onMessage('artistFound', async message => {
    const threshold =
      (await extensionStorage.getItem('ai-action-threshold')) ??
      DEFAULT_THRESHOLD

    lastResult = await Promise.all(
      message.data.map(async req => {
        const id = req.artistId

        if (threshold === 'any') {
          const source = await AiArtistsServiceInstance.getArtistSource(id)
          return { artistId: id, ai: source !== null, source }
        }

        if (threshold === 'deezer_any') {
          const deezer = await AiArtistsServiceInstance.hasDeezerArtist(id)
          return { artistId: id, ai: deezer, source: deezer ? 'deezer' : null }
        }

        // deezer_100
        const strict = await AiArtistsServiceInstance.hasDeezerArtist100(id)
        return { artistId: id, ai: strict, source: strict ? 'deezer' : null }
      })
    )

    return lastResult
  })

  onMessage('getLatestArtist', () => {
    return lastResult
  })

  onMessage('getCounts', async () => ({
    deezerAll: await AiArtistsServiceInstance.getDeezerAllCount(),
    deezer100: await AiArtistsServiceInstance.getDeezer100Count(),
    slopless: await AiArtistsServiceInstance.getSloplessCount()
  }))
})
