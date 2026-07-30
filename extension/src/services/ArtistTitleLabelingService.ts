import AiLabelingService from '@/services/AiLabelingService'
import type { Artist } from '@/services/AiLabelingService'

/**
 * Adds "AI" label to the title on the artist page.
 *
 * The main difference from the ArtistLabelingService is that the title is not a link
 * and we need to get the artist ID from the URL of the page, not from the link itself.
 */
export class ArtistTitleLabelingService extends AiLabelingService {
  protected override getLabelStyles(
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
      `color: ${textColor}`
    ]
  }
  protected override getElements(): HTMLAnchorElement[] {
    // First, find the element for the artist title
    const titleRoot = document.querySelector<HTMLAnchorElement>(
      'div[class^="PageHeaderTitle_root__"]'
    )

    if (!titleRoot) {
      return []
    }

    // Then find the title element itself
    const title = titleRoot.querySelector<HTMLAnchorElement>(
      'span[class*="PageHeaderTitle_title__"]'
    )

    if (!title) {
      return []
    }

    return [title]
  }

  protected override getArtist(element: HTMLAnchorElement): Artist {
    // Since it's not a link, we need to get the artist ID
    // from the URL of the page
    const artistHref = location.href
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

  protected override observe(): MutationObserver | null {
    const observer = new MutationObserver(() => {
      void this.scan()
    })

    observer.observe(document, {
      childList: true,
      subtree: true
    })

    return observer
  }
}
