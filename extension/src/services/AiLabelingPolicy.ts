import type { ArtistData, TrackData } from '@/types/Api'

export const AI_ARTIST_THRESHOLD = 0.05 // 5% is the threshold for labeling an artist as AI
export const AI_TRACK_THRESHOLD = 0.5 // 50% is the threshold for labeling a track as AI

export type SourceSettings = {
  useSlopless: boolean
  useYandex: boolean
}

export type LabelDecision = {
  slopless: boolean
  yandex: boolean
  ai: boolean
}

/**
 * Labels an artist when Slopless or Yandex Music meets its enabled-source threshold.
 */
export function decideArtist(
  artist: ArtistData,
  settings: SourceSettings
): LabelDecision {
  const slopless =
    settings.useSlopless &&
    artist.totalTracks > 0 &&
    artist.aiTracks / artist.totalTracks >= AI_ARTIST_THRESHOLD
  const yandex =
    settings.useYandex &&
    artist.yandexCheckedTracks > 0 &&
    artist.yandexAiTracks / artist.yandexCheckedTracks >= AI_ARTIST_THRESHOLD

  return { slopless, yandex, ai: slopless || yandex }
}

/**
 * Labels a track when enabled Slopless or Yandex Music identifies it as AI.
 */
export function decideTrack(
  track: TrackData,
  settings: SourceSettings
): LabelDecision {
  const slopless =
    settings.useSlopless &&
    track.score !== null &&
    track.score > AI_TRACK_THRESHOLD
  const yandex =
    settings.useYandex &&
    track.scoreYandex !== null &&
    // 1, 2 or 3 mean the track is identified as AI by Yandex Music
    track.scoreYandex >= 1 &&
    track.scoreYandex <= 3

  return { slopless, yandex, ai: slopless || yandex }
}

export function shouldTakeAutomaticAction(
  artists: ArtistData[],
  track: TrackData | null,
  settings: SourceSettings,
  strictTracks: boolean
): boolean {
  const trackDecision = track ? decideTrack(track, settings) : null

  if (trackDecision?.yandex) return true

  for (const artist of artists) {
    const artistDecision = decideArtist(artist, settings)

    if (artistDecision.ai && (!strictTracks || !track)) return true
    if (artistDecision.ai && trackDecision?.ai) return true
  }

  return false
}
