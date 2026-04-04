import { AiArtistsServiceInstance } from './AiArtistsService'
import { extensionStorage } from '@/storage'
import type { BlacklistJobStatus } from '@/types/Messages'

type BlacklistJobState = {
  running: boolean
  queue: string[]
  processed: string[]
  currentArtistId: string | null
  tabId: number | undefined
}

/**
 * Automatically blacklists AI-generated artists by visiting their pages and clicking the "Dislike" button.
 */
export default class ArtistBlacklistingService {
  private readonly STORAGE_KEY = 'processed-ai-artists'
  private readonly URL = 'https://music.yandex.com'
  private abortController: AbortController | null = null

  protected state: BlacklistJobState = {
    running: false,
    queue: [],
    processed: [],
    currentArtistId: null,
    tabId: undefined
  }

  public async start(
    onProgress?: (status: BlacklistJobStatus) => void
  ): Promise<void> {
    if (this.state.running) {
      return
    }

    this.clear()

    this.state.running = true

    try {
      const allArtists = await AiArtistsServiceInstance.getAiArtists()
      const processed = await this.getProcessedArtists()

      // Enqueue artists that haven't been processed yet
      for (const artistId of allArtists) {
        if (!processed.has(artistId)) {
          this.state.queue.push(artistId)
        }
      }

      const reportProgress = () => {
        onProgress?.({
          running: this.state.running,
          processed: this.state.processed.length,
          total: this.state.queue.length,
          currentArtistId: this.state.currentArtistId
        })
      }

      reportProgress()

      // Process the artists one by one
      for (const artistId of this.state.queue) {
        // Check for cancellation
        if (!this.state.running) {
          break
        }

        this.state.currentArtistId = artistId
        reportProgress()

        try {
          // Wrap in try-catch to prevent from stopping the entire process
          await this.openArtistPage(artistId)
          await this.blacklistArtist()
          await this.saveProcessedArtist(artistId)
          this.state.processed.push(artistId)
          reportProgress()
        } catch (error) {
          console.error(`Error processing artist ${artistId}:`, error)
        }
      }
    } catch (error) {
      console.error('Error during artist blacklisting:', error)
    } finally {
      this.state.running = false
      this.state.currentArtistId = null
      onProgress?.({
        running: this.state.running,
        processed: this.state.processed.length,
        total: this.state.queue.length,
        currentArtistId: this.state.currentArtistId
      })
    }
  }

  public stop(): void {
    this.state.running = false
    this.abortController?.abort()
  }

  protected clear(): void {
    this.state = {
      running: false,
      queue: [],
      processed: [],
      currentArtistId: null,
      tabId: undefined
    }
  }

  protected async openArtistPage(artistId: string): Promise<void> {
    const url = this.URL
    const artistUrl = `${url}/artist/${artistId}`
    const artistUrlPrefix = `${url}/artist/`

    if (!this.state.tabId) {
      const tab = await browser.tabs.create({ url })
      this.state.tabId = tab.id
    }

    const controller = new AbortController()
    const tabId = this.state.tabId
    this.abortController = controller

    return new Promise((resolve, reject) => {
      let debounceTimeout: ReturnType<typeof setTimeout> | null = null

      const cleanup = () => {
        browser.tabs.onUpdated.removeListener(listener)

        if (debounceTimeout) {
          clearTimeout(debounceTimeout)
          debounceTimeout = null
        }
      }

      const debounceResolve = (tabUrl?: string) => {
        if (!tabUrl?.startsWith(artistUrlPrefix)) {
          return
        }

        if (debounceTimeout) {
          clearTimeout(debounceTimeout)
        }

        debounceTimeout = setTimeout(() => {
          cleanup()
          resolve()
        }, 1000)
      }

      const listener = (
        updatedTabId: number,
        changeInfo: globalThis.Browser.tabs.OnUpdatedInfo,
        tab: globalThis.Browser.tabs.Tab
      ) => {
        if (updatedTabId !== tabId) {
          return
        }

        if (changeInfo.url) {
          debounceResolve(changeInfo.url)
        }

        if (
          changeInfo.status === 'loading' ||
          changeInfo.status === 'complete'
        ) {
          debounceResolve(tab.url)
        }
      }

      controller.signal.addEventListener(
        'abort',
        () => {
          cleanup()
          reject(new DOMException('Aborted', 'AbortError'))
        },
        { once: true }
      )

      browser.tabs.onUpdated.addListener(listener)

      void browser.tabs.update(tabId, { url: artistUrl }).catch(error => {
        cleanup()
        reject(error)
      })
    })
  }

  protected async blacklistArtist(): Promise<void> {
    if (!this.state.tabId) {
      return
    }

    await browser.scripting.executeScript({
      target: { tabId: this.state.tabId },
      func: async () => {
        // Wait for the button to appear
        let button: HTMLButtonElement | null = null

        while (!button) {
          await new Promise(resolve => setTimeout(resolve, 250))

          button = document.querySelector(
            'button[class*="PageHeaderArtist_menuControl__"]'
          )
        }

        button.click()

        // Find the correct button in the menu
        let menu: Element | null = null

        while (!menu) {
          await new Promise(resolve => setTimeout(resolve, 250))

          menu = document.querySelector('div[role="menu"]')
        }

        // The "Dislike" button is always the last one, at least for now
        const dislikeButton = menu.lastChild as HTMLElement | null

        if (!dislikeButton) {
          console.warn('Dislike button not found for artist')
          return
        }

        // Make sure we haven't disliked the artist already
        if (dislikeButton.querySelector(`use[*|href*="disliked_xxs"]`)) {
          return
        }

        // Finally, get rid of AI slop
        dislikeButton?.click()

        // Wait for the notification to appear
        let notification: Element | null = null

        while (!notification) {
          await new Promise(resolve => setTimeout(resolve, 250))

          notification = document.querySelector(
            'div[class^="NotificationDislike_message__"]'
          )
        }
      }
    })
  }

  protected async getProcessedArtists(): Promise<Set<string>> {
    const processed = await extensionStorage.getItem(this.STORAGE_KEY)

    return new Set<string>(processed ?? [])
  }

  protected async saveProcessedArtist(artistId: string): Promise<void> {
    const processed = await this.getProcessedArtists()
    processed.add(artistId)

    await extensionStorage.setItem(this.STORAGE_KEY, Array.from(processed))
  }
}
