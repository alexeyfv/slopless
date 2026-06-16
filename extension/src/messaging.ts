import { VerifyRequest, VerifyResult } from '@/types/Messages'
import { defineExtensionMessaging } from '@webext-core/messaging'

type CheckAiStatusRequest = {
  artistIds: string[]
}

type CheckAiStatusResponse = {
  ai: boolean
}

interface ProtocolMap {
  artistFound(request: VerifyRequest[]): VerifyResult[]
  getLatestArtist(): VerifyResult[] | null
  getCounts(): { deezerAll: number; deezer100: number; slopless: number }
  checkAiStatus(request: CheckAiStatusRequest): CheckAiStatusResponse
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
