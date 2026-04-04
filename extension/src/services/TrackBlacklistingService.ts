import { AiArtistsServiceInstance } from './AiArtistsService'

export type Artist = {
  artistName: string
  artistHref: string
  artistId: string
  labelTarget: HTMLElement
}

/**
 * Automatically blacklists AI tracks while they are playing.
 */
export default class TrackBlacklistingService {
  private currentTrackId: string | null = null

  public async start(): Promise<void> {
    await this.scan()
    this.observe()
  }

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

  protected async scan(): Promise<void> {
    const playerBar = document.querySelector<HTMLElement>(
      'section[class*="PlayerBarDesktopWithBackgroundProgressBar_root__"]'
    )

    if (!playerBar) {
      return
    }

    // Collect all artists from the player
    const elements = Array.from(
      playerBar.querySelectorAll<HTMLAnchorElement>('a[href^="/artist/"]')
    )

    if (elements.length === 0) {
      return
    }

    const artists = elements.map(this.getArtist)

    const trackElement =
      playerBar.querySelector<HTMLAnchorElement>('a[href^="/album/"]')

    if (!trackElement) {
      console.warn('Track element not found in player bar')
      return
    }

    const trackHref = trackElement.href
    const i = trackHref.lastIndexOf('/')
    const trackId = trackHref.substring(i + 1)

    if (this.currentTrackId === trackId) {
      return
    }

    this.currentTrackId = trackId

    try {
      const aiArtists = await AiArtistsServiceInstance.getAiArtists()
      const ai = artists.find(a => aiArtists.has(a.artistId))

      if (!ai) {
        return
      }

      // Find player controls
      let controls: Element | null = null

      while (!controls) {
        await new Promise(resolve => setTimeout(resolve, 250))

        controls = playerBar.querySelector(
          'div[class*="PlayerBarDesktopWithBackgroundProgressBar_sonata__"]'
        )
      }

      // Find the dislike button
      let buttons = Array.from(
        controls.querySelectorAll('button[aria-pressed]')
      ) as HTMLButtonElement[]

      let button: HTMLButtonElement | null = null

      for (const b of buttons) {
        if (b.querySelector('use[*|href*="dislike_xs"]')) {
          button = b
          break
        }
      }

      if (!button) {
        console.warn('Dislike button not found for now playing track')
        return
      }

      button?.click()

      // Wait for the notification to appear
      let notification: Element | null = null

      while (!notification) {
        await new Promise(resolve => setTimeout(resolve, 250))

        notification = document.querySelector(
          'div[class^="NotificationDislike_message__"]'
        )
      }
    } finally {
      if (this.currentTrackId === trackId) {
        this.currentTrackId = null
      }
    }
  }

  protected observe(): MutationObserver | null {
    const observer = new MutationObserver(() => {
      void this.scan()
    })

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'aria-pressed']
    })

    return observer
  }
}
