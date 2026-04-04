import {
  BlacklistJobStatus,
  VerifyRequest,
  VerifyResult
} from '@/types/Messages'
import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  artistFound(request: VerifyRequest[]): VerifyResult[]
  getLatestArtist(): VerifyResult[] | null
  getBlacklistJobStatus(): BlacklistJobStatus
  startBlacklistJob(): BlacklistJobStatus
  stopBlacklistJob(): BlacklistJobStatus
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
