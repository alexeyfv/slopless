import { defineConfig } from 'vitepress'

const SITE_URL = 'https://extension.slopless.art'

function toUrl(relativePath: string): string {
  let path = relativePath
  if (path.endsWith('.md')) path = path.slice(0, -3)
  path = '/' + path
  if (path.endsWith('/index')) path = path.slice(0, -5) + '/'
  return path
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: 'Slopless',
  description: 'Keep your music free of AI slop.',
  sitemap: {
    hostname: SITE_URL
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Slopless' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'og:image', content: `${SITE_URL}/cover.png` }],
    [
      'meta',
      {
        name: 'google-site-verification',
        content: 'jXz7EqyUQHfYnypG5iREgfXAN0yXZ1TVoDUT5MplTDo'
      }
    ],
    [
      'meta',
      {
        name: 'yandex-verification',
        content: '0e5d9ed44dd9f310'
      }
    ]
  ],
  transformHead: async ({ pageData, siteConfig }) => {
    const path = toUrl(pageData.relativePath)
    const url = `${SITE_URL}${path}`
    const isRu = path.startsWith('/ru')
    const imageUrl = isRu ? `${SITE_URL}/ru-cover.png` : `${SITE_URL}/cover.png`
    const lang = isRu ? 'ru' : 'en'

    const alternatePath = isRu
      ? path.replace(/^\/ru/, '') || '/'
      : path === '/'
        ? '/ru/'
        : `/ru${path}`

    const tags: [string, Record<string, string>][] = [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      [
        'meta',
        {
          property: 'og:title',
          content: pageData.title ? `${pageData.title} – Slopless` : 'Slopless'
        }
      ],
      [
        'meta',
        { property: 'og:locale', content: lang === 'ru' ? 'ru_RU' : 'en_US' }
      ],
      ['meta', { property: 'og:image', content: imageUrl }],
      [
        'meta',
        {
          name: 'twitter:title',
          content: pageData.title ? `${pageData.title} – Slopless` : 'Slopless'
        }
      ],
      ['meta', { name: 'twitter:image', content: imageUrl }],
      [
        'link',
        {
          rel: 'alternate',
          hreflang: lang === 'ru' ? 'en' : 'ru',
          href: `${SITE_URL}${alternatePath}`
        }
      ]
    ]

    if (pageData.description) {
      tags.push(
        ['meta', { property: 'og:description', content: pageData.description }],
        ['meta', { name: 'twitter:description', content: pageData.description }]
      )
    }

    return tags
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/alexeyfv/slopless' },
      {
        icon: 'telegram',
        link: 'https://t.me/yet_another_dev'
      }
    ]
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Slopless',
      description: 'Keep your music free of AI slop.',
      themeConfig: {
        nav: [
          { text: 'Yandex Music Stats', link: 'https://slopless.art' },
          { text: 'Releases', link: '/releases' },
          { text: 'FAQ', link: '/faq' },
          { text: 'Privacy', link: '/privacy-policy' }
        ]
      }
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      title: 'Slopless',
      description: 'Музыка без нейрослопа.',
      themeConfig: {
        nav: [
          { text: 'Статистика Яндекс Музыки', link: 'https://slopless.art' },
          { text: 'Релизы', link: '/ru/releases' },
          { text: 'FAQ', link: '/ru/faq' },
          { text: 'Политика конфиденциальности', link: '/ru/privacy-policy' }
        ]
      }
    }
  }
})
