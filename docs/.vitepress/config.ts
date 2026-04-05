import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/slopless/',
  title: 'Slopless',
  description: 'Keep your music free of AI slop.',
  head: [
    [
      'meta',
      {
        name: 'google-site-verification',
        content: 'L2Lup3bdyxHnWxUd9UZcT7sAdI8f8xsIRDPcm4oUA7Y'
      }
    ]
  ],
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
          { text: 'Home', link: '/' },
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
          { text: 'Главная', link: '/ru/' },
          { text: 'Политика конфиденциальности', link: '/ru/privacy-policy' }
        ]
      }
    }
  }
})
