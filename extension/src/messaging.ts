import {
  ArtistVerifyRequest,
  ArtistVerifyResult,
  TrackVerifyRequest,
  TrackVerifyResult
} from '@/types/Messages'
import { defineExtensionMessaging } from '@webext-core/messaging'

type CheckAiStatusRequest = {
  artistIds: string[]
  trackId?: string
}

type CheckAiStatusResponse = {
  ai: boolean
}

interface ProtocolMap {
  artistFound(request: ArtistVerifyRequest[]): ArtistVerifyResult[]
  trackFound(request: TrackVerifyRequest[]): TrackVerifyResult[]
  getLatestArtist(): ArtistVerifyResult[] | null
  getCounts(): Promise<{
    aiArtistsCount: number
    totalArtistsCount: number
    totalAiTracks: number
  }>
  checkAiStatus(request: CheckAiStatusRequest): CheckAiStatusResponse
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
