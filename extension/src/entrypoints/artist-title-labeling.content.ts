import { ArtistTitleLabelingService } from '../services/ArtistTitleLabelingService'

export default defineContentScript({
  matches: ['*://music.yandex.com/*', '*://music.yandex.ru/*'],
  main: async function () {
    // To display the AI label on the artist page,
    // we need to use a separate algorithm that checks
    // the title of the page instead of the links
    const service = new ArtistTitleLabelingService()
    await service.start()
  }
})
