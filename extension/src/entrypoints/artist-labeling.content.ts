import ArtistLabelingService from '@/services/ArtistLabelingService'
import { MATCHES_DOMAINS } from '@/types/Domains'

export default defineContentScript({
  matches: MATCHES_DOMAINS,
  main: async function () {
    const engine = new ArtistLabelingService()
    await engine.start()
  }
})
