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
  private readonly DEEZER_TOOLTIP =
    'This artist has tracks that were labeled as generated with the use of AI'
  private readonly XGBOOST_TOOLTIP_HTML =
    'This artist most probably has tracks that were generated with the use of AI'

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

  protected createLabel(source: 'deezer' | 'slopless' | null) {
    const isDeezer = source === 'deezer'
    const isSlopless = source === 'slopless'

    const borderColor = isSlopless ? 'rgb(245 158 11)' : 'rgb(239 68 68)'
    const bgColor = isSlopless
      ? 'rgba(245 158 11 / 0.12)'
      : 'rgba(239 68 68 / 0.12)'
    const textColor = isSlopless ? 'rgb(245 158 11)' : 'rgb(239 68 68)'
    const tooltipHtml = isDeezer
      ? this.DEEZER_TOOLTIP
      : isSlopless
        ? this.XGBOOST_TOOLTIP_HTML
        : ''

    const slopLabel = document.createElement('span')

    const styles = [
      'display: inline-flex',
      'align-items: center',
      'margin: 0px 6px',
      'padding: 0px 6px',
      `border: 1px solid ${borderColor}`,
      'border-radius: 4px',
      `background: ${bgColor}`,
      `color: ${textColor}`,
      'cursor: default',
      'position: relative'
    ]

    slopLabel.className = this.SLOPLESS_LABEL
    slopLabel.textContent = 'AI'
    slopLabel.style.cssText = styles.join('; ')

    if (tooltipHtml) {
      const tooltip = document.createElement('span')
      tooltip.innerHTML = tooltipHtml
      tooltip.style.cssText = [
        'display: none',
        'position: fixed',
        'z-index: 99999',
        'background: #1a1a1a',
        'color: #fff',
        'border-radius: 6px',
        'padding: 8px 12px',
        'font-size: 13px',
        'line-height: 1.4',
        'max-width: 280px',
        'white-space: normal',
        'box-shadow: 0 4px 12px rgba(0,0,0,0.3)'
      ].join('; ')
      slopLabel.appendChild(tooltip)

      slopLabel.addEventListener('mouseenter', () => {
        const rect = slopLabel.getBoundingClientRect()
        tooltip.style.display = 'block'
        tooltip.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`
        tooltip.style.top = `${rect.bottom + 6}px`

        if (rect.bottom + 6 + tooltip.offsetHeight > window.innerHeight) {
          tooltip.style.top = `${rect.top - 6 - tooltip.offsetHeight}px`
        }
      })

      slopLabel.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none'
      })
    }

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
