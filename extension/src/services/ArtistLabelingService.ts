import { sendMessage } from '@/messaging'
import type { VerifyRequest, VerifyResult } from '../types/Messages'

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
    const map = new Map<string, boolean>()
    for (const result of verifyResult) {
      map.set(result.artistId, result.ai)
    }

    for (const a of artists) {
      // 1. Check the artists status
      const ai = map.get(a.artistId)

      if (ai !== true) {
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
      const label = this.createSlopLabel()
      a.labelTarget.insertAdjacentElement('beforeend', label)
    }
  }

  protected createSlopLabel() {
    const slopLabel = document.createElement('span')

    const styles = [
      'display: inline-flex',
      'align-items: center',
      'margin: 0px 6px',
      'padding: 0px 6px',
      'border: 1px solid rgb(239 68 68)',
      'border-radius: 4px',
      'background: rgba(239 68 68 / 0.12)',
      'color: rgb(239 68 68)'
    ]

    slopLabel.className = this.SLOPLESS_LABEL
    slopLabel.textContent = 'AI'
    slopLabel.style.cssText = styles.join('; ')

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
    await this.scan()
    this.observe()
  }
}
