import { AiArtistsServiceInstance } from '@/services/AiArtistsService'
import type { VerifyResult } from '../types/Messages'
import type { BlacklistJobStatus } from '@/types/Messages'
import ArtistBlacklistingService from '@/services/ArtistBlacklistingService'
import { onMessage } from '@/messaging'
import { defineJobScheduler } from '@webext-core/job-scheduler'

const blacklistService = new ArtistBlacklistingService()
const jobs = defineJobScheduler()
const BLACKLIST_JOB_ID = 'artist-blacklisting'
const idleBlacklistJobStatus: BlacklistJobStatus = {
  running: false,
  processed: 0,
  total: 0,
  currentArtistId: null
}

let lastResult: VerifyResult[] | null = null
let blacklistJobStatus: BlacklistJobStatus = {
  ...idleBlacklistJobStatus
}

export default defineBackground(() => {
  onMessage('artistFound', async message => {
    const aiArtists = await AiArtistsServiceInstance.getAiArtists()
    const set = new Set(aiArtists)

    lastResult = message.data.map(req => {
      return {
        artistId: req.artistId,
        ai: set.has(req.artistId)
      }
    })

    return lastResult
  })

  onMessage('getLatestArtist', () => {
    return lastResult
  })

  onMessage('getBlacklistJobStatus', () => {
    return { ...blacklistJobStatus }
  })

  onMessage('startBlacklistJob', async () => {
    if (blacklistJobStatus.running) {
      return { ...blacklistJobStatus }
    }

    blacklistJobStatus = {
      running: true,
      processed: 0,
      total: 0,
      currentArtistId: null
    }

    await jobs.scheduleJob({
      id: BLACKLIST_JOB_ID,
      type: 'once',
      date: Date.now(),
      execute: () =>
        blacklistService.start(status => {
          blacklistJobStatus = status
        })
    })

    return { ...blacklistJobStatus }
  })

  onMessage('stopBlacklistJob', async () => {
    await jobs.removeJob(BLACKLIST_JOB_ID)
    blacklistService.stop()

    blacklistJobStatus = {
      ...blacklistJobStatus,
      running: false,
      currentArtistId: null
    }

    return { ...blacklistJobStatus }
  })
})
