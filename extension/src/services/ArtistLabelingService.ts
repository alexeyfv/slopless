import { sendMessage } from '@/messaging'
import { extensionStorage, DEFAULT_LOCALE } from '@/storage'
import type { VerifyRequest, VerifyResult } from '../types/Messages'
import type { Locale } from '../storage'
import { t } from '@/locales'

export type Artist = {
  artistName: string
  artistHref: string
  artistId: string
  labelTarget: HTMLElement
}

/**
 * Adds "AI" label to artists on any appearance of their name on the page.
 */
export default class ArtistLabelingService {
  protected SLOPLESS_LABEL = 'slopless-label'
  protected locale: Locale = DEFAULT_LOCALE

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

  protected async scan() {
    // 1. Collect all artist links on the page
    const elements = this.getElements()

    if (elements.length === 0) {
      return
    }

    // 2. Extract artist info
    const artists = elements.map(this.getArtist)

    // 3. Report artists to background script if they differ from the last report
    const request: VerifyRequest[] = artists.map(a => {
      return {
        artistId: a.artistId
      }
    })

    const result = await sendMessage('artistFound', request)

    this.addSloplessLabel(artists, result)
  }

  protected addSloplessLabel(
    artists: Artist[],
    verifyResult: VerifyResult[]
  ): void {
    // Create a map for faster lookups
    const map = new Map<string, VerifyResult>()
    for (const result of verifyResult) {
      map.set(result.artistId, result)
    }

    for (const a of artists) {
      // 1. Check the artists status
      const result = map.get(a.artistId)

      if (!result || !result.ai) {
        continue
      }

      // 2. Check if label already exists to avoid duplicates
      const container = a.labelTarget
      const existingLabel = container.querySelector<HTMLSpanElement>(
        'span.' + this.SLOPLESS_LABEL
      )

      if (existingLabel) {
        continue
      }

      // 2. Create and insert label
      const label = this.createLabel(result.source)
      a.labelTarget.insertAdjacentElement('beforeend', label)
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

  protected createLabel(source: 'deezer' | 'slopless' | null) {
    const isSlopless = source === 'slopless'

    const borderColor = isSlopless ? 'rgb(245 158 11)' : 'rgb(239 68 68)'
    const bgColor = isSlopless
      ? 'rgba(245 158 11 / 0.12)'
      : 'rgba(239 68 68 / 0.12)'
    const textColor = isSlopless ? 'rgb(245 158 11)' : 'rgb(239 68 68)'

    const tooltipKey =
      source === 'deezer'
        ? 'tooltip.deezer'
        : source === 'slopless'
          ? 'tooltip.slopless'
          : null

    const slopLabel = document.createElement('span')

    const styles = this.getLabelStyles(borderColor, bgColor, textColor)

    slopLabel.className = this.SLOPLESS_LABEL
    slopLabel.textContent = t(this.locale, 'artist.label')
    slopLabel.style.cssText = styles.join('; ')

    if (tooltipKey) slopLabel.title = t(this.locale, tooltipKey)

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

  public async start() {
    const saved = await extensionStorage.getItem('locale')
    this.locale = saved === 'ru' || saved === 'en' ? saved : DEFAULT_LOCALE
    await this.scan()
    this.observe()
  }
}
