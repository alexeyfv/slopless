import AiLabelingService from '@/services/AiLabelingService'
import { MATCHES_DOMAINS } from '@/types/Domains'

export default defineContentScript({
  matches: MATCHES_DOMAINS,
  main: async function () {
    const engine = new AiLabelingService()
    await engine.start()
  }
})
