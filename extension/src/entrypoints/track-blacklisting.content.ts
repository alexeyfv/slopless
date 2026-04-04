import TrackBlacklistingService from '@/services/TrackBlacklistingService'

export default defineContentScript({
  matches: ['*://music.yandex.com/*'],
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
