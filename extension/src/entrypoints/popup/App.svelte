<script lang="ts">
  import IconBrandGithub from '@tabler/icons-svelte/icons/brand-github'
  import IconBrandTelegram from '@tabler/icons-svelte/icons/brand-telegram'
  import { onMount } from 'svelte'
  import { Switch } from '@skeletonlabs/skeleton-svelte'
  import { sendMessage } from '../../messaging'
  import {
    DEFAULT_BEHAVIOR,
    DEFAULT_THRESHOLD,
    DEFAULT_STRICT_TRACKS,
    extensionStorage
  } from '../../storage'
  import type { AiMusicBehavior, AiActionThreshold } from '../../storage'

  let deezerAllCount = 0
  let deezer100Count = 0
  let sloplessCount = 0
  let behavior: AiMusicBehavior = DEFAULT_BEHAVIOR
  let threshold: AiActionThreshold = DEFAULT_THRESHOLD
  let strictTracks = DEFAULT_STRICT_TRACKS
  let dislikesUrl = 'https://music.yandex.com/collection/dislikes?tab=tracks'
  let displayText = ''

  const resolveDislikesUrl = async () => {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
      })
      if (tab?.url) {
        const tld = new URL(tab.url).hostname.split('.').pop()
        dislikesUrl = `https://music.yandex.${tld}/collection/dislikes?tab=tracks`
      }
    } catch {
      // Keep the .com default if query fails
    }
  }

  const loadCounts = async () => {
    const counts = await sendMessage('getCounts')
    deezerAllCount = counts.deezerAll
    deezer100Count = counts.deezer100
    sloplessCount = counts.slopless
  }

  const loadBehavior = async () => {
    const saved = await extensionStorage.getItem('ai-music-behavior')
    behavior = saved ?? DEFAULT_BEHAVIOR
  }

  const saveBehavior = async (value: AiMusicBehavior) => {
    behavior = value
    await extensionStorage.setItem('ai-music-behavior', value)
  }

  const loadThreshold = async () => {
    const saved = await extensionStorage.getItem('ai-action-threshold')
    threshold = saved ?? DEFAULT_THRESHOLD
  }

  const saveThreshold = async (value: AiActionThreshold) => {
    threshold = value
    await extensionStorage.setItem('ai-action-threshold', value)
  }

  const loadStrictTracks = async () => {
    const saved = await extensionStorage.getItem('ai-action-strict-tracks')
    strictTracks = saved ?? DEFAULT_STRICT_TRACKS
  }

  const saveStrictTracks = async (value: boolean) => {
    strictTracks = value
    await extensionStorage.setItem('ai-action-strict-tracks', value)
  }

  onMount(() => {
    void resolveDislikesUrl()
    void loadCounts()
    void loadBehavior()
    void loadThreshold()
    void loadStrictTracks()
  })

  $: {
    const total = deezerAllCount + sloplessCount
    if (total === 0) {
      displayText = 'Loading database...'
    } else {
      const active =
        threshold === 'any'
          ? total
          : threshold === 'deezer_any'
            ? deezerAllCount
            : deezer100Count
      displayText = `Slopless will act on ${active.toLocaleString()} artists (${Math.round((active / total) * 100)}% of database)`
    }
  }
</script>

<main class="flex w-125 flex-col gap-4 p-4">
  <!-- Header -->
  <h1 class="h1 text-center">Slopless</h1>

  <!-- Form -->
  <form class="mx-auto w-full max-w-md space-y-4">
    <label class="label">
      <span class="label-text">What to do with AI music?</span>
      <select
        id="ai-behavior"
        class="select"
        value={behavior}
        onchange={e => saveBehavior(e.currentTarget.value as AiMusicBehavior)}
      >
        <option value="dislike">Dislike</option>
        <option value="dislike_if_not_liked">Dislike if not liked</option>
        <option value="skip">Skip track</option>
        <option value="skip_if_not_liked">Skip if not liked</option>
        <option value="nothing">Do nothing</option>
        <option value="like">Like</option>
      </select>
    </label>

    {#if behavior === 'dislike'}
      <p class="text-xs opacity-50">
        Slopless clicks the Dislike button on Yandex Music. The track will be
        removed from your collection and added to your dislikes
        <a
          class="text-primary-500 underline hover:no-underline"
          href={dislikesUrl}
          target="_blank"
          rel="noreferrer">here</a
        >
        .
      </p>
      <p class="text-xs opacity-50">
        The dislike action also auto-skips the track. This is Yandex Music's
        behavior, not the extension's.
      </p>
    {/if}

    {#if behavior === 'dislike_if_not_liked'}
      <p class="text-xs opacity-50">
        Slopless clicks the Dislike button only if the track has not been liked.
        Tracks you have liked will be preserved. This is useful if you genuinely
        enjoy some AI-generated tracks.
      </p>
    {/if}

    {#if behavior === 'skip'}
      <p class="text-xs opacity-50">
        Slopless clicks the Next button on Yandex Music. The track will be
        skipped without any other actions.
      </p>
    {/if}

    {#if behavior === 'skip_if_not_liked'}
      <p class="text-xs opacity-50">
        Slopless skips the track only if it has not been liked. Liked tracks are
        preserved and continue playing. This is useful if you genuinely enjoy
        some AI-generated tracks.
      </p>
    {/if}

    {#if behavior === 'nothing'}
      <p class="text-xs opacity-50">
        Slopless will not click any buttons. AI artists will still be labeled on
        the page.
      </p>
    {/if}

    {#if behavior === 'like'}
      <p class="text-xs opacity-50">
        Slopless clicks the Like button on Yandex Music. The track will be added
        to your favorites.
      </p>
      <p class="text-xs opacity-50">
        Yandex may recommend more AI-generated content after this. Use only if
        you actually like AI music.
      </p>
    {/if}

    <Switch
      checked={strictTracks}
      onCheckedChange={details => saveStrictTracks(details.checked)}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Only act on verified AI tracks</Switch.Label>
      <Switch.HiddenInput />
    </Switch>
    <p class="text-xs opacity-50 -mt-2">
      When enabled, Slopless will only act on a track if it is confirmed in the
      Deezer dataset. Otherwise the artist is labeled but no action is taken.
      Useful when not all of an artist's releases are AI-generated.
    </p>

    <label class="label">
      <span class="label-text">Source of data</span>
      <select
        id="ai-threshold"
        class="select"
        value={threshold}
        onchange={e =>
          saveThreshold(e.currentTarget.value as AiActionThreshold)}
      >
        <option value="any">Deezer + Slopless</option>
        <option value="deezer_any">Deezer only</option>
        <option value="deezer_100">Deezer strict</option>
      </select>
    </label>

    {#if threshold === 'any'}
      <p class="text-xs opacity-50">
        Artists with at least one release flagged as AI on Deezer, and artists
        detected by Slopless as probable AI artists.
      </p>
    {:else if threshold === 'deezer_any'}
      <p class="text-xs opacity-50">
        Only artists with at least one release flagged as AI on Deezer.
      </p>
    {:else}
      <p class="text-xs opacity-50">
        Only artists where 100% of releases are flagged as AI on Deezer.
      </p>
    {/if}

    <p class="text-xs opacity-50">
      <a
        class="text-primary-500 underline hover:no-underline"
        href="https://alexeyfv.github.io/slopless/detection"
        target="_blank"
        rel="noreferrer">Learn how we detect AI music.</a
      >
    </p>
  </form>

  <p class="text-xs text-center font-semibold opacity-60">{displayText}</p>

  <footer class="gap-2 flex justify-center">
    <a
      class="btn btn-sm preset-outlined-primary-500 items-center justify-center gap-2"
      href="https://github.com/alexeyfv/slopless"
      rel="noreferrer"
      target="_blank"
      aria-label="Open the Slopless GitHub repository"
      title="GitHub repository"
    >
      <IconBrandGithub size={14} />
      <span>GitHub</span>
    </a>
    <a
      class="btn btn-sm preset-outlined-primary-500 items-center justify-center gap-2"
      href="https://t.me/yet_another_dev"
      rel="noreferrer"
      target="_blank"
      aria-label="Open the Slopless Telegram channel"
      title="Telegram channel"
    >
      <IconBrandTelegram size={14} />
      <span>Telegram</span>
    </a>
  </footer>
</main>
