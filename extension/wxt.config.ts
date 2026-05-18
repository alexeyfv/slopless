import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'
// See https://wxt.dev/api/config.html

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifestVersion: 3,
  manifest: {
    permissions: ['storage', 'scripting', 'alarms'],
    host_permissions: [
      'https://raw.githubusercontent.com/alexeyfv/slopless/refs/heads/main/data/yandex_music.json',
      'https://music.yandex.com/*',
      'https://music.yandex.ru/*'
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
