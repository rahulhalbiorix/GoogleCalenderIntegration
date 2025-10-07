<template>
  <div class="p-6 text-center">
    <h2 class="text-2xl font-bold mb-4 text-blue-700">
      Sign in with Google to use Google Calendar
    </h2>

    <button
      @click="handleAuthClick"
      :disabled="!isGapiLoaded"
      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      Sign In with Google
    </button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { gapi } from 'gapi-script'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'

const isGapiLoaded = ref(false)
const tokenClient = ref<any>(null)
const store = useAuthStore()
const router = useRouter()

declare const google: any

/**
 * ✅ Load Google Identity Script Dynamically
 * Ensures `google.accounts.oauth2` is defined before use
 */
function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-identity')) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.id = 'google-identity'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity script'))
    document.head.appendChild(script)
  })
}

/**
 * ✅ Handle Google Login Click
 */
function handleAuthClick() {
  if (!tokenClient.value) {
    alert('⚠️ Google API not initialized yet')
    return
  }

  console.log('🔵 Requesting access token...')
  tokenClient.value.requestAccessToken({ prompt: 'consent' })
}

/**
 * ✅ Initialize Google API & Identity Services
 */
onMounted(async () => {
  try {
    // Step 1: Load Google Identity script
    await loadGoogleIdentityScript()
    console.log('✅ Google Identity script loaded')

    // Step 2: Initialize gapi client
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        })
        isGapiLoaded.value = true
        console.log('✅ gapi.client initialized')

        // Step 3: Initialize OAuth2 token client
        tokenClient.value = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse: any) => {
            console.log('✅ Access token received:', tokenResponse.access_token)

            // Store token in Pinia
            store.SetToken(tokenResponse.access_token)
            store.isUserLoggedIn = true

            // Set token in gapi
            gapi.client.setToken({ access_token: tokenResponse.access_token })

            // Redirect to Dashboard
            router.push({ name: 'dashboard' })
          },
        })
      } catch (err) {
        console.error('❌ gapi.client init error:', err)
      }
    })
  } catch (error) {
    console.error('❌ Google Identity script failed:', error)
  }
})
</script>
