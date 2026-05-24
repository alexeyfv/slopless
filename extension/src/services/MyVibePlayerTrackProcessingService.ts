import { AiArtistsServiceInstance } from './AiArtistsService'
import {
  DEFAULT_BEHAVIOR,
  DEFAULT_THRESHOLD,
  extensionStorage
} from '@/storage'

export type Artist = {
  artistName: string
  artistHref: string
  artistId: string
  labelTarget: HTMLElement
}

/**
 * Handles tracks while they are playing in My Vibe player.
 */
export default class MyVibePlayerTrackProcessingService {
  private currentTrackText: string | null = null

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
    const myVibePage = document.querySelector<HTMLElement>(
      'div[class*="VibePage_meta__"]'
    )

    if (!myVibePage) {
      return
    }

    const behavior =
      (await extensionStorage.getItem('ai-music-behavior')) ?? DEFAULT_BEHAVIOR

    if (behavior === 'nothing') {
      return
    }

    // Collect all artists from the player
    const elements = Array.from(
      myVibePage.querySelectorAll<HTMLAnchorElement>('a[href^="/artist/"]')
    )

    if (elements.length === 0) {
      return
    }

    const artists = elements.map(this.getArtist)

    const trackElement = myVibePage.querySelector<HTMLAnchorElement>(
      'div[class*="VibePlayerbarMeta_trackNameText__"]'
    )

    if (!trackElement) {
      console.warn('Track element not found in player bar')
      return
    }

    const trackText = trackElement.textContent || ''

    if (!trackText) {
      return
    }

    if (this.currentTrackText === trackText) {
      return
    }

    this.currentTrackText = trackText

    let actionTaken = false

    try {
      const threshold =
        (await extensionStorage.getItem('ai-action-threshold')) ??
        DEFAULT_THRESHOLD

      let ai = false

      if (threshold === 'deezer_100') {
        // In this mode we label artist only if 100%
        // of their releases were made with the help of AI
        for (const a of artists) {
          if (await AiArtistsServiceInstance.hasDeezerArtist100(a.artistId)) {
            ai = true
            break
          }
        }
      } else {
        // Check Deezer artists (any% of AI releases) and optionally Slopless model
        for (const a of artists) {
          if (await AiArtistsServiceInstance.hasDeezerArtist(a.artistId)) {
            ai = true
            break
          }

          if (
            threshold === 'any' &&
            (await AiArtistsServiceInstance.hasSlopless(a.artistId))
          ) {
            ai = true
            break
          }
        }
      }

      if (!ai) {
        return
      }

      const strictTracks =
        (await extensionStorage.getItem('ai-action-strict-tracks')) ?? false

      if (strictTracks) {
        return
      }

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

      if (actionTaken) {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    } finally {
      if (actionTaken) {
        this.currentTrackText = null
      }
    }
  }

  private async isLiked(): Promise<boolean> {
    const container = 'section[class*="VibePlayerBar_root__"]'
    for (let i = 0; i < 50; i++) {
      const controls = document.querySelector(container)
      if (controls) {
        const likeButton = controls.querySelector<HTMLButtonElement>(
          'button[aria-label="Like"]'
        )
        if (likeButton)
          return likeButton.getAttribute('aria-pressed') === 'true'
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
        'section[class*="VibePlayerBar_root__"]'
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
