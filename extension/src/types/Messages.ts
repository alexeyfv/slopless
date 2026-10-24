import type { YandexAiTrack } from './Api'

export type ArtistVerifyRequest = {
  artistId: string
}

export type ArtistVerifyResult = {
  artistId: string
  ai: boolean
  aiTracks: number
  totalTracks: number
  yandexAiTracks: number
  yandexCheckedTracks: number
  yandexAiTrackList: YandexAiTrack[]
  name: string
}

export type TrackVerifyRequest = {
  trackId: string
}

export type TrackVerifyResult = {
  trackId: string
  ai: boolean
  score: number | null
  scoreYandex: number | null
}
