import { sendMessage } from '@/messaging'
import { extensionStorage, DEFAULT_LOCALE, DEFAULT_SHOW_ARTIST_LABELS, DEFAULT_SHOW_TRACK_LABELS } from '@/storage'
import type { ArtistVerifyRequest, ArtistVerifyResult, TrackVerifyRequest, TrackVerifyResult } from '../types/Messages'
import type { Locale } from '../storage'
import { t } from '@/locales'

export type Artist = {
  artistName: string
  artistHref: string
  artistId: string
  labelTarget: HTMLElement
}

export type Track = {
  trackId: string
  trackHref: string
  trackName: string
  labelTarget: HTMLElement
}

export default class AiLabelingService {
  protected SLOPLESS_LABEL = 'slopless-label'
  protected locale: Locale = DEFAULT_LOCALE
  protected showArtistLabels = DEFAULT_SHOW_ARTIST_LABELS
  protected showTrackLabels = DEFAULT_SHOW_TRACK_LABELS

  protected getArtist(element: HTMLAnchorElement): Artist {
    const artistHref = element.href
    const artistName = element.textContent
    const i = artistHref.lastIndexOf('/')
    const artistId = artistHref.substring(i + 1)

    return {
      artistName,
      artistHref,
      artistId,
      labelTarget: element
    }
  }

  protected getElements(): HTMLAnchorElement[] {
    return Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/artist/"]')
    )
  }

  protected getTrackElements(): HTMLAnchorElement[] {
    return Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href*="/track/"]')
    )
  }

  protected getTrack(element: HTMLAnchorElement): Track {
    const trackHref = element.href
    const trackName = element.textContent
    const i = trackHref.lastIndexOf('/')
    const trackId = trackHref.substring(i + 1)

    return {
      trackId,
      trackHref,
      trackName,
      labelTarget: element
    }
  }

  protected async scan() {
    const elements = this.getElements()

    if (elements.length > 0) {
      const artists = elements.map(this.getArtist)

      const request: ArtistVerifyRequest[] = artists.map(a => {
        return {
          artistId: a.artistId
        }
      })

      const result = await sendMessage('artistFound', request)

      this.addSloplessLabel(artists, result)
    }

    await this.scanTracks()
  }

  protected async scanTracks() {
    const elements = this.getTrackElements()

    if (elements.length === 0) {
      return
    }

    const tracks = elements.map(this.getTrack)

    const request: TrackVerifyRequest[] = tracks.map(t => {
      return {
        trackId: t.trackId
      }
    })

    const result = await sendMessage('trackFound', request)

    this.addTrackLabel(tracks, result)
  }

  protected addSloplessLabel(
    artists: Artist[],
    verifyResult: ArtistVerifyResult[]
  ): void {
    if (!this.showArtistLabels) return

    const map = new Map<string, ArtistVerifyResult>()
    for (const result of verifyResult) {
      map.set(result.artistId, result)
    }

    for (const a of artists) {
      const result = map.get(a.artistId)

      if (!result || !result.ai) {
        continue
      }

      const container = a.labelTarget
      const existingLabel = container.querySelector<HTMLSpanElement>(
        'span.' + this.SLOPLESS_LABEL
      )

      if (existingLabel) {
        continue
      }

      const label = this.createLabel()
      a.labelTarget.insertAdjacentElement('beforeend', label)
    }
  }

  protected addTrackLabel(
    tracks: Track[],
    verifyResult: TrackVerifyResult[]
  ): void {
    if (!this.showTrackLabels) return

    const map = new Map<string, TrackVerifyResult>()
    for (const result of verifyResult) {
      map.set(result.trackId, result)
    }

    for (const t of tracks) {
      const result = map.get(t.trackId)

      if (!result || !result.ai) {
        continue
      }

      const container = t.labelTarget
      const existingLabel = container.querySelector<HTMLSpanElement>(
        'span.' + this.SLOPLESS_LABEL
      )

      if (existingLabel) {
        continue
      }

      const label = this.createLabel('track.label', 'tooltip.track_ai')
      t.labelTarget.insertAdjacentElement('beforeend', label)
    }
  }

  protected getLabelStyles(
    borderColor: string,
    bgColor: string,
    textColor: string
  ): string[] {
    return [
      'margin: 0px 6px',
      'padding: 0px 6px',
      `border: 1px solid ${borderColor}`,
      'border-radius: 4px',
      `background: ${bgColor}`,
      `color: ${textColor}`,
      'font-size: smaller'
    ]
  }

  protected createLabel(labelKey = 'artist.label', tooltipKey = 'tooltip.ai') {
    const borderColor = 'rgb(239 68 68)'
    const bgColor = 'rgba(239 68 68 / 0.12)'
    const textColor = 'rgb(239 68 68)'

    const slopLabel = document.createElement('span')

    const styles = this.getLabelStyles(borderColor, bgColor, textColor)

    slopLabel.className = this.SLOPLESS_LABEL
    slopLabel.textContent = t(this.locale, labelKey)
    slopLabel.style.cssText = styles.join('; ')
    slopLabel.title = t(this.locale, tooltipKey)

    return slopLabel
  }

  protected observe(): MutationObserver | null {
    const observer = new MutationObserver(() => {
      void this.scan()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    })

    return observer
  }

  protected clearAllLabels() {
    document.querySelectorAll('span.' + this.SLOPLESS_LABEL).forEach(el => {
      el.remove()
    })
  }

  protected listenStorageChanges() {
    browser.storage.onChanged.addListener(changes => {
      let rescan = false

      if (changes['show-artist-labels']) {
        this.showArtistLabels = changes['show-artist-labels'].newValue ?? DEFAULT_SHOW_ARTIST_LABELS
        rescan = true
      }

      if (changes['show-track-labels']) {
        this.showTrackLabels = changes['show-track-labels'].newValue ?? DEFAULT_SHOW_TRACK_LABELS
        rescan = true
      }

      if (rescan) {
        this.clearAllLabels()
        void this.scan()
      }
    })
  }

  public async start() {
    const saved = await extensionStorage.getItem('locale')
    this.locale = saved === 'ru' || saved === 'en' ? saved : DEFAULT_LOCALE

    const showArtist = await extensionStorage.getItem('show-artist-labels')
    this.showArtistLabels = showArtist ?? DEFAULT_SHOW_ARTIST_LABELS

    const showTrack = await extensionStorage.getItem('show-track-labels')
    this.showTrackLabels = showTrack ?? DEFAULT_SHOW_TRACK_LABELS

    await this.scan()
    this.observe()
    this.listenStorageChanges()
  }
}
