<script lang="ts">
  import IconBrandGithub from '@tabler/icons-svelte/icons/brand-github'
  import IconBrandTelegram from '@tabler/icons-svelte/icons/brand-telegram'
  import { onMount } from 'svelte'
  import { Switch } from '@skeletonlabs/skeleton-svelte'
  import { sendMessage } from '../../messaging'
  import {
    DEFAULT_BEHAVIOR,
    DEFAULT_STRICT_TRACKS,
    DEFAULT_LOCALE,
    extensionStorage
  } from '../../storage'
  import type { AiMusicBehavior, Locale } from '../../storage'
  import { t } from '../../locales'

  let totalAitracks = 0
  let behavior: AiMusicBehavior = DEFAULT_BEHAVIOR
  let strictTracks = DEFAULT_STRICT_TRACKS
  let locale: Locale = DEFAULT_LOCALE
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
    totalAitracks = counts.totalAiTracks
  }

  const loadBehavior = async () => {
    const saved = await extensionStorage.getItem('ai-music-behavior')
    behavior = saved ?? DEFAULT_BEHAVIOR
  }

  const saveBehavior = async (value: AiMusicBehavior) => {
    behavior = value
    await extensionStorage.setItem('ai-music-behavior', value)
  }

  const loadStrictTracks = async () => {
    const saved = await extensionStorage.getItem('ai-action-strict-tracks')
    strictTracks = saved ?? DEFAULT_STRICT_TRACKS
  }

  const saveStrictTracks = async (value: boolean) => {
    strictTracks = value
    await extensionStorage.setItem('ai-action-strict-tracks', value)
  }

  const loadLocale = async () => {
    const saved = await extensionStorage.getItem('locale')
    locale = saved === 'ru' || saved === 'en' ? saved : DEFAULT_LOCALE
  }

  const saveLocale = async (value: Locale) => {
    locale = value
    await extensionStorage.setItem('locale', value)
  }

  onMount(() => {
    void resolveDislikesUrl()
    void loadCounts()
    void loadBehavior()
    void loadStrictTracks()
    void loadLocale()
  })

  $: document.title = t(locale, 'popup_title')

  $: {
    if (totalAitracks === 0) {
      displayText = t(locale, 'loading')
    } else {
      displayText = t(locale, 'display_text', {
        count: totalAitracks.toLocaleString()
      })
    }
  }
</script>

<main class="flex w-135 flex-col gap-4 p-4">
  <!-- Header -->
  <div class="flex items-center gap-2">
    <h1 class="h1 flex-1">Slopless</h1>
    <select
      class="select select-sm w-24"
      value={locale}
      onchange={e => saveLocale(e.currentTarget.value as Locale)}
    >
      <option value="ru">{t(locale, 'locale.ru')}</option>
      <option value="en">{t(locale, 'locale.en')}</option>
    </select>
  </div>

  <!-- Form -->
  <form class="mx-auto w-full space-y-4">
    <p class="text-xs opacity-50">
      <a
        class="text-primary-500 underline hover:no-underline"
        href="https://alexeyfv.github.io/slopless/faq#how-does-slopless-detect-ai-music"
        target="_blank"
        rel="noreferrer">{t(locale, 'learn_link')}</a
      >
    </p>

    <label class="label">
      <span class="label-text">{t(locale, 'behavior_label')}</span>
      <select
        id="ai-behavior"
        class="select"
        value={behavior}
        onchange={e => saveBehavior(e.currentTarget.value as AiMusicBehavior)}
      >
        <option value="dislike">{t(locale, 'behavior.dislike')}</option>
        <option value="dislike_if_not_liked"
          >{t(locale, 'behavior.dislike_if_not_liked')}</option
        >
        <option value="skip">{t(locale, 'behavior.skip')}</option>
        <option value="skip_if_not_liked"
          >{t(locale, 'behavior.skip_if_not_liked')}</option
        >
        <option value="nothing">{t(locale, 'behavior.nothing')}</option>
        <option value="like">{t(locale, 'behavior.like')}</option>
      </select>
    </label>

    {#if behavior === 'dislike'}
      <p class="text-xs opacity-50">
        {t(locale, 'desc.dislike')}
        <a
          class="text-primary-500 underline hover:no-underline"
          href={dislikesUrl}
          target="_blank"
          rel="noreferrer">{t(locale, 'desc.dislike.link')}</a
        >
        {t(locale, 'desc.dislike.suffix')}
      </p>
    {/if}

    {#if behavior === 'dislike_if_not_liked'}
      <p class="text-xs opacity-50">
        {t(locale, 'desc.dislike_if_not_liked')}
      </p>
    {/if}

    {#if behavior === 'skip'}
      <p class="text-xs opacity-50">
        {t(locale, 'desc.skip')}
      </p>
    {/if}

    {#if behavior === 'skip_if_not_liked'}
      <p class="text-xs opacity-50">
        {t(locale, 'desc.skip_if_not_liked')}
      </p>
    {/if}

    {#if behavior === 'nothing'}
      <p class="text-xs opacity-50">
        {t(locale, 'desc.nothing')}
      </p>
    {/if}

    {#if behavior === 'like'}
      <p class="text-xs opacity-50">
        {t(locale, 'desc.like.p1')}
      </p>
      <p class="text-xs opacity-50">
        {t(locale, 'desc.like.p2')}
      </p>
    {/if}

    <Switch
      checked={strictTracks}
      onCheckedChange={details => saveStrictTracks(details.checked)}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>{t(locale, 'switch_label')}</Switch.Label>
      <Switch.HiddenInput />
    </Switch>
    <p class="text-xs opacity-50 -mt-2">
      {t(locale, 'switch_desc')}
    </p>
  </form>

  <p class="text-xs text-center font-semibold opacity-60">{displayText}</p>

  <footer class="gap-2 flex justify-center">
    <a
      class="btn btn-sm preset-outlined-primary-500 items-center justify-center gap-2"
      href="https://github.com/alexeyfv/slopless"
      rel="noreferrer"
      target="_blank"
      aria-label={t(locale, 'github_aria')}
      title={t(locale, 'github_title')}
    >
      <IconBrandGithub size={14} />
      <span>GitHub</span>
    </a>
    <a
      class="btn btn-sm preset-outlined-primary-500 items-center justify-center gap-2"
      href="https://t.me/yet_another_dev"
      rel="noreferrer"
      target="_blank"
      aria-label={t(locale, 'telegram_aria')}
      title={t(locale, 'telegram_title')}
    >
      <IconBrandTelegram size={14} />
      <span>Telegram</span>
    </a>
  </footer>
</main>
