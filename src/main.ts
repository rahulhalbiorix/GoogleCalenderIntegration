import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PrimeVue } from '@primevue/core'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'
import { definePreset } from '@primeuix/themes'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(router)

const MyPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        semantic: {
          highlight: {
            background: '{primary.50}',
            color: '{primary.700}',
          },
        },
      },
      dark: {
        semantic: {
          highlight: {
            background: '{primary.200}',
            color: '{primary.900}',
          },
        },
      },
    },
  },
})

app.use(PrimeVue, MyPreset)
app.use(pinia)
app.mount('#app')
