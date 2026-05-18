import ArtistLabelingService from '@/services/ArtistLabelingService'

export default defineContentScript({
  matches: ['*://music.yandex.com/*', '*://music.yandex.ru/*'],
  main: async function () {
    const engine = new ArtistLabelingService()
    await engine.start()
  }
})
