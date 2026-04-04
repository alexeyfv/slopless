<script lang="ts">
  import { IconBrandGithub, IconBrandTelegram } from '@tabler/icons-svelte'
  import { onMount } from 'svelte'
  import { sendMessage } from '../../messaging'
  import { Progress } from '@skeletonlabs/skeleton-svelte'
  import type { BlacklistJobStatus, VerifyResult } from '../../types/Messages'

  let lastResult: VerifyResult[] = []
  let count = 0
  let blacklistJobStatus: BlacklistJobStatus = {
    running: false,
    processed: 0,
    total: 0,
    currentArtistId: null
  }
  let blacklistProgress = 0

  const refreshState = async () => {
    const [latestResult, latestJobStatus] = await Promise.all([
      sendMessage('getLatestArtist'),
      sendMessage('getBlacklistJobStatus')
    ])

    lastResult = latestResult ?? []
    count = new Set(
      lastResult.filter(result => result.ai).map(result => result.artistId)
    ).size
    blacklistJobStatus = latestJobStatus
  }

  onMount(() => {
    void refreshState()

    const interval = setInterval(() => {
      void refreshState()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  })

  async function toggleBlacklistJob() {
    if (blacklistJobStatus.running) {
      await sendMessage('stopBlacklistJob')
    } else {
      await sendMessage('startBlacklistJob')
    }

    await refreshState()
  }

  $: {
    if (blacklistJobStatus.running) {
      if (blacklistJobStatus.total > 0) {
        blacklistProgress =
          (blacklistJobStatus.processed / blacklistJobStatus.total) * 100
      } else {
        blacklistProgress = 0
      }
    } else {
      blacklistProgress = 0
    }
  }
</script>

<main class="flex w-[300px] flex-col gap-4 p-4">
  <h1 class="h1">Slopless</h1>

  <button class="btn preset-outlined-primary-500" on:click={toggleBlacklistJob}>
    {blacklistJobStatus.running
      ? 'Stop blacklisting'
      : 'Blacklist all AI artists'}
  </button>

  {#if blacklistJobStatus.running}
    <Progress value={blacklistProgress} class="grid gap-2">
      <div class="flex items-center justify-between gap-2">
        <Progress.Label class="text-xs font-semibold opacity-60">
          Blacklisting {blacklistJobStatus.processed} / {blacklistJobStatus.total}
        </Progress.Label>
        <Progress.ValueText class="text-xs opacity-60" />
      </div>
      <Progress.Track class="h-2 bg-primary-50-950">
        <Progress.Range class="bg-primary-500" />
      </Progress.Track>
      {#if blacklistJobStatus.currentArtistId}
        <p class="truncate text-xs opacity-60">
          Now processing {blacklistJobStatus.currentArtistId}
        </p>
      {/if}
    </Progress>
  {/if}

  {#if count > 0}
    <div class="space-y-2">
      <h2 class="text-xs font-semibold opacity-60">
        {count} AI artist(s) detected
      </h2>
    </div>
  {:else}
    <p class="text-sm opacity-70">No AI artists detected.</p>
  {/if}

  <footer class="gap-2 flex">
    <a
      class="btn preset-outlined-primary-500 flex-1 items-center justify-center gap-2"
      href="https://github.com/alexeyfv/slopless"
      rel="noreferrer"
      target="_blank"
      aria-label="Open the Slopless GitHub repository"
      title="GitHub repository"
    >
      <IconBrandGithub size={18} />
      <span>GitHub</span>
    </a>
    <a
      class="btn preset-outlined-primary-500 flex-1 items-center justify-center gap-2"
      href="https://t.me/yet_another_dev"
      rel="noreferrer"
      target="_blank"
      aria-label="Open the Slopless Telegram channel"
      title="Telegram channel"
    >
      <IconBrandTelegram size={18} />
      <span>Telegram</span>
    </a>
  </footer>
</main>
