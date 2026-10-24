export type YandexAiTrack = {
  id: number
  title: string
  status: number
}

export type ArtistData = {
  id: number
  name: string
  aiTracks: number
  totalTracks: number
  yandexAiTracks: number
  yandexCheckedTracks: number
  yandexAiTrackList: YandexAiTrack[]
}

export type TrackData = {
  id: number
  score: number | null
  scoreYandex: number | null
}
