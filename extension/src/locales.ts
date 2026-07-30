import type { Locale } from './storage'

const messages: Record<Locale, Record<string, string>> = {
  ru: {
    behavior_label: 'Что делать с ИИ-музыкой?',

    'behavior.dislike': 'Дизлайк',
    'behavior.dislike_if_not_liked': 'Дизлайк, если не лайкнуто',
    'behavior.skip': 'Пропустить',
    'behavior.skip_if_not_liked': 'Пропустить, если не лайкнуто',
    'behavior.nothing': 'Ничего не делать',
    'behavior.like': 'Лайк',

    'desc.dislike':
      'Slopless нажимает кнопку «Дизлайк». Если есть «Лайк», то он будет снят, а трек будет добавлен в список ',
    'desc.dislike.link': 'дизлайков',
    'desc.dislike.suffix':
      '. Также воспроизведение автоматически переключится на следующий трек.',

    'desc.dislike_if_not_liked':
      'Slopless нажимает кнопку «Дизлайк» только если трек не был лайкнут. Ваши лайкнутые треки останутся нетронутыми. Полезно, если некоторые ИИ-треки вам действительно нравятся.',

    'desc.skip':
      'Slopless нажимает кнопку «Далее». Трек будет пропущен без других действий.',

    'desc.skip_if_not_liked':
      'Slopless нажимает кнопку «Далее» только если трек не был лайкнут. Ваши лайкнутые треки продолжат играть. Полезно, если некоторые ИИ-треки вам действительно нравятся.',

    'desc.nothing':
      'Slopless не будет нажимать никакие кнопки. Маркировка ИИ-исполнителей продолжает работать.',

    'desc.like.p1':
      'Slopless нажимает кнопку «Лайк». Трек будет добавлен в вашу коллекцию «Мне нравится».',
    'desc.like.p2':
      'Учтите, что Яндекс может начать рекомендовать ещё больше ИИ-контента. Используйте, только если вам действительно очень нравится ИИ-музыка.',

    switch_label: 'Выполнять действия только с ИИ-треками',
    switch_desc:
      'Когда включено, Slopless выполняет действия только с ИИ-треками артиста. Полезно, когда не все релизы артиста сгенерированы ИИ.',

    'locale.ru': '🇷🇺 Ру',
    'locale.en': '🇬🇧 En',

    'artist.label': 'ИИ',
    'tooltip.ai': 'У этого артиста есть треки, созданные с помощью ИИ',

    'track.label': 'ИИ',
    'tooltip.track_ai': 'Этот трек создан с помощью ИИ',

    enable_artist_labels: 'Помечать ИИ-артистов',
    enable_artist_labels_desc: 'Показывать метку «ИИ» рядом с именами артистов',
    enable_track_labels: 'Помечать ИИ-треки',
    enable_track_labels_desc: 'Показывать метку «ИИ» рядом с названиями треков',

    popup_title: 'Slopless'
  },

  en: {
    behavior_label: 'What to do with AI music?',

    'behavior.dislike': 'Dislike',
    'behavior.dislike_if_not_liked': 'Dislike if not liked',
    'behavior.skip': 'Skip',
    'behavior.skip_if_not_liked': 'Skip if not liked',
    'behavior.nothing': 'Do nothing',
    'behavior.like': 'Like',

    'desc.dislike':
      'Slopless clicks the Dislike button. If the track is liked, the Like is removed and the track is added to your ',
    'desc.dislike.link': 'dislikes',
    'desc.dislike.suffix':
      '. Playback will automatically skip to the next track.',

    'desc.dislike_if_not_liked':
      'Slopless clicks the Dislike button only if the track has not been liked. Your liked tracks stay untouched. Useful if you genuinely enjoy some AI-generated tracks.',

    'desc.skip':
      'Slopless clicks the Next button. The track will be skipped without any other actions.',

    'desc.skip_if_not_liked':
      'Slopless clicks the Next button only if the track has not been liked. Your liked tracks keep playing. Useful if you genuinely enjoy some AI-generated tracks.',

    'desc.nothing':
      'Slopless will not click any buttons. AI artist labels will still appear on the page.',

    'desc.like.p1':
      'Slopless clicks the Like button. The track is added to your favorites.',
    'desc.like.p2':
      'Note that Yandex may recommend even more AI content afterward. Use only if you really like AI music.',

    switch_label: 'Only act on AI tracks',
    switch_desc:
      "When enabled, Slopless only acts on the artist's AI tracks. Useful when not all of an artist's releases are AI-generated.",

    'locale.ru': '🇷🇺 Ру',
    'locale.en': '🇬🇧 En',

    'artist.label': 'AI',
    'tooltip.ai':
      'This artist has tracks that were generated with the use of AI',

    'track.label': 'AI',
    'tooltip.track_ai': 'This track was generated with the use of AI',

    enable_artist_labels: 'Label AI artists',
    enable_artist_labels_desc: 'Show "AI" badge next to artist names',
    enable_track_labels: 'Label AI tracks',
    enable_track_labels_desc: 'Show "AI" badge next to track names',

    popup_title: 'Slopless'
  }
}

export function t(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const msg = messages[locale]?.[key] ?? messages.en?.[key] ?? key
  if (!params) return msg
  return msg.replace(/\{(\w+)\}/g, (_, k: string) =>
    String(params[k] ?? `{${k}}`)
  )
}
