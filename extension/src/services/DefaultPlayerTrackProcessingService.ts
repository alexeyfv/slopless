import { sendMessage } from '@/messaging'
import { DEFAULT_BEHAVIOR, extensionStorage } from '@/storage'

export type Artist = {
  artistName: string
  artistHref: string
  artistId: string
  labelTarget: HTMLElement
}

/**
 * Handles tracks while they are playing in default player.
 */
export default class DefaultPlayerTrackProcessingService {
  // Prevents processing the same track multiple times when MutationObserver triggers again after a button click
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
      '[class*="PlayerBarDesktopWithBackgroundProgressBar_root__"], [class*="PlayerBarDesktopWithBackgroundProgressBar_player__"]'
    )

    if (!playerBar) {
      return
    }

    const behavior =
      (await extensionStorage.getItem('ai-music-behavior')) ?? DEFAULT_BEHAVIOR

    if (behavior === 'nothing') {
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

    let actionTaken = false

    try {
      const { ai } = await sendMessage('checkAiStatus', {
        artistIds: artists.map(a => a.artistId)
      })

      if (!ai) {
        return
      }

      // Wait a bit before new action
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (behavior === 'dislike' || behavior === 'dislike_if_not_liked') {
        if (behavior === 'dislike_if_not_liked' && (await this.isLiked())) {
          actionTaken = false
        } else {
          actionTaken = await this.clickPlayerButton({
            pollInterval: 250,
            buttonSelector: 'button[aria-pressed]',
            targetSelector: '#dislike_',
            alreadyDoneSelector: '#disliked_'
          })
        }
      } else if (behavior === 'like') {
        actionTaken = await this.clickPlayerButton({
          pollInterval: 250,
          buttonSelector: 'button[aria-pressed]',
          targetSelector: '#like_',
          alreadyDoneSelector: '#liked_'
        })
      } else if (behavior === 'skip' || behavior === 'skip_if_not_liked') {
        if (behavior === 'skip_if_not_liked' && (await this.isLiked())) {
          actionTaken = false
        } else {
          actionTaken = await this.clickPlayerButton({
            pollInterval: 100,
            buttonSelector: 'button',
            targetSelector: '#next_'
          })
        }
      }
    } finally {
      if (actionTaken) {
        this.currentTrackId = null
      }
    }
  }

  private async isLiked(): Promise<boolean> {
    const container =
      '[class*="PlayerBarDesktopWithBackgroundProgressBar_sonata__"]'
    for (let i = 0; i < 20; i++) {
      const controls = document.querySelector(container)
      if (controls) {
        const liked = controls.querySelector(
          'button[aria-pressed] use[*|href*="#liked_"]'
        )
        if (liked) return true
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return false
  }

  private async clickPlayerButton(options: {
    pollInterval: number
    buttonSelector: string
    targetSelector: string
    alreadyDoneSelector?: string
  }): Promise<boolean> {
    let button: HTMLButtonElement | null = null

    while (!button) {
      await new Promise(resolve => setTimeout(resolve, options.pollInterval))

      const controls = document.querySelector(
        '[class*="PlayerBarDesktopWithBackgroundProgressBar_sonata__"]'
      )
      if (!controls) continue

      const buttons = Array.from(
        controls.querySelectorAll(options.buttonSelector)
      ) as HTMLButtonElement[]

      for (const b of buttons) {
        if (
          options.alreadyDoneSelector &&
          b.querySelector(`use[*|href*="${options.alreadyDoneSelector}"]`)
        ) {
          // Sometimes we may reach this state when the button was already pressed
          // In that case just return without any action
          return false
        }
        if (b.querySelector(`use[*|href*="${options.targetSelector}"]`)) {
          button = b
          break
        }
      }
    }

    button.click()
    return true
  }

  protected observe(): MutationObserver | null {
    const observer = new MutationObserver(() => {
      void this.scan()
    })

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    })

    return observer
  }
}
