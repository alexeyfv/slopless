export type ArtistVerifyRequest = {
  artistId: string
}

export type ArtistVerifyResult = {
  artistId: string
  ai: boolean
  aiTracks: number
  totalTracks: number
  name: string
}

export type TrackVerifyRequest = {
  trackId: string
}

export type TrackVerifyResult = {
  trackId: string
  ai: boolean
  score: number | null
}
