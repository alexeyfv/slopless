import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'
// See https://wxt.dev/api/config.html

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifestVersion: 3,
  manifest: {
    permissions: ['storage'],
    host_permissions: [
      'https://slopless.art/*',
      'https://music.yandex.com/*',
      'https://music.yandex.ru/*',
      'https://music.yandex.by/*',
      'https://music.yandex.kz/*',
      'https://music.yandex.uz/*'
    ],
    browser_specific_settings: {
      gecko: {
        id: '@slopless',
        data_collection_permissions: {
          required: ['none']
        }
      }
    }
  },
  vite: () => ({
    plugins: [tailwindcss()]
  })
})
