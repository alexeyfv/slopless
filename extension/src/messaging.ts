import { VerifyRequest, VerifyResult } from '@/types/Messages'
import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  artistFound(request: VerifyRequest[]): VerifyResult[]
  getLatestArtist(): VerifyResult[] | null
  getCounts(): { deezerAll: number; deezer100: number; slopless: number }
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
