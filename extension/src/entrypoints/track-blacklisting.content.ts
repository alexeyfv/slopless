import TrackBlacklistingService from '@/services/TrackBlacklistingService'
import { MATCHES_DOMAINS } from '@/types/Domains'

export default defineContentScript({
  matches: MATCHES_DOMAINS,
  main: async function () {
    const playerBar = document.querySelector(
      'section[class*="PlayerBarDesktopWithBackgroundProgressBar_root__"]'
    )

    if (!playerBar) {
      return
    }

    const service = new TrackBlacklistingService()
    await service.start()
  }
})
