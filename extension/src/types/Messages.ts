export type VerifyRequest = {
  artistId: string
}

export type VerifyResult = {
  artistId: string
  ai: boolean
}

export type BlacklistJobStatus = {
  running: boolean
  processed: number
  total: number
  currentArtistId: string | null
}
