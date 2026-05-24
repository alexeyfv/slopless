import MyVibePlayerTrackProcessingService from '@/services/MyVibePlayerTrackProcessingService'
import { MATCHES_DOMAINS } from '@/types/Domains'

export default defineContentScript({
  matches: MATCHES_DOMAINS,
  main: async function () {
    const myVibePage = document.querySelector('div[class*="VibePage_meta__"]')

    if (!myVibePage) {
      return
    }

    const service = new MyVibePlayerTrackProcessingService()
    await service.start()
  }
})
