export type VerifyRequest = {
  artistId: string
}

export type VerifyResult = {
  artistId: string
  ai: boolean
  source: 'deezer' | 'slopless' | null
}
