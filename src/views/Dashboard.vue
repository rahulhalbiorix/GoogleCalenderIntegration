<template>
  <div class="max-w-4xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-md">
    <h2 class="text-3xl font-bold text-blue-700 mb-8 text-center">My Google Calendar Events</h2>

    <!-- Loading State -->
    <div v-if="!isGapiReady" class="text-center text-gray-500 text-lg py-10">
      Loading Google API...
    </div>

    <!-- No Events -->
    <div v-else-if="!events.length" class="text-center text-gray-500 text-lg py-10">
      No upcoming events found.
    </div>

    <!-- Events List -->
    <ul v-else class="space-y-6">
      <li
        v-for="event in events"
        :key="event.id"
        class="bg-white rounded-xl shadow hover:shadow-lg transition relative overflow-hidden border-l-8 border-blue-500"
      >
        <div class="p-6">
          <!-- Event Header -->
          <div class="flex justify-between items-start">
            <h3 class="text-xl font-semibold text-gray-800">{{ event.summary }}</h3>
            <a :href="event.htmlLink" target="_blank" class="text-blue-600 hover:underline text-sm">
              View
            </a>
          </div>

          <!-- Date & Time -->
          <p class="text-gray-600 mt-2 flex items-center space-x-2">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              {{ formatDate(event.start.dateTime || event.start.date) }}
            </span>
            <span class="text-gray-400">→</span>
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              {{ formatDate(event.end.dateTime || event.end.date) }}
            </span>
          </p>

          <!-- Description -->
          <p
            v-if="event.description"
            class="text-gray-700 mt-3 border-l-2 border-gray-200 pl-3 italic"
          >
            {{ event.description }}
          </p>

          <!-- Attendees -->
          <div v-if="event.attendees?.length" class="mt-4">
            <h4 class="text-gray-600 font-medium text-sm mb-1">Attendees:</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="attendee in event.attendees"
                :key="attendee.email"
                class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ attendee.email }}
              </span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { gapi } from 'gapi-script'

const store = useAuthStore()
const isGapiReady = ref(false)
const events = ref<any[]>([])

// format date nicely
function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString()
}

// fetch Google Calendar events
async function fetchEvents() {
  if (!store.token) {
    alert('⚠️ Please sign in with Google first!')
    return
  }

  gapi.client.setToken({ access_token: store.token })

  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    })

    events.value = response.result.items || []
  } catch (error) {
    console.error('❌ Error fetching events:', error)
    alert('Failed to fetch events. Check console.')
  }
}

// initialize gapi client
onMounted(async () => {
  await new Promise<void>((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        })
        isGapiReady.value = true
        console.log('✅ gapi.client initialized')
        await fetchEvents()
        resolve()
      } catch (err) {
        console.error('❌ gapi init error:', err)
        reject(err)
      }
    })
  })
})
</script>

<style scoped></style>
