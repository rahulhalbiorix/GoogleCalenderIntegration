<template>
  <div class="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6 mt-10">
    <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">Schedule a Meeting</h2>

    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Title -->
      <div>
        <label class="block font-semibold mb-1">Title of Meeting</label>
        <input
          v-model="meeting.title"
          type="text"
          placeholder="Enter meeting title"
          class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
      </div>

      <!-- Date & Time -->
      <div>
        <label class="block font-semibold mb-1">Date & Time</label>
        <input
          v-model="meeting.datetime"
          type="datetime-local"
          class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <p v-if="errors.datetime" class="text-red-500 text-sm mt-1">{{ errors.datetime }}</p>
      </div>

      <!-- Duration -->
      <div>
        <label class="block font-semibold mb-1">Duration (minutes)</label>
        <input
          v-model.number="meeting.duration"
          type="number"
          min="1"
          placeholder="Enter duration"
          class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <p v-if="errors.duration" class="text-red-500 text-sm mt-1">{{ errors.duration }}</p>
      </div>

      <!-- Attendees -->
      <div>
        <label class="block font-semibold mb-1">Invite Attendees (emails)</label>
        <input
          v-model="meeting.attendees"
          type="text"
          placeholder="Enter emails separated by commas"
          class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <p v-if="errors.attendees" class="text-red-500 text-sm mt-1">{{ errors.attendees }}</p>
      </div>

      <!-- Notes -->
      <div>
        <label class="block font-semibold mb-1">Notes / Agenda</label>
        <textarea
          v-model="meeting.notes"
          placeholder="Enter meeting notes or agenda"
          class="w-full border border-gray-300 rounded-lg p-2 h-24 focus:outline-none focus:ring focus:ring-blue-200"
        ></textarea>
        <p v-if="errors.notes" class="text-red-500 text-sm mt-1">{{ errors.notes }}</p>
      </div>

      <!-- Submit Button -->
      <div class="text-center">
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Schedule Meeting
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { gapi } from 'gapi-script'

// --------------------
// Types
// --------------------
interface Meeting {
  title: string
  datetime: string
  duration: number | ''
  attendees: string
  notes: string
}

interface MeetingErrors {
  title?: string
  datetime?: string
  duration?: string
  attendees?: string
  notes?: string
}

// --------------------
// States
// --------------------
const store = useAuthStore()
const isGapiReady = ref(false)

const meeting = ref<Meeting>({
  title: '',
  datetime: '',
  duration: '',
  attendees: '',
  notes: '',
})

const errors = ref<MeetingErrors>({})

// --------------------
// Helper Functions
// --------------------
function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validateForm(): boolean {
  errors.value = {}

  // All fields are required
  if (!meeting.value.title.trim()) errors.value.title = 'Title is required.'
  if (!meeting.value.datetime) errors.value.datetime = 'Date & Time is required.'
  if (!meeting.value.duration || meeting.value.duration <= 0)
    errors.value.duration = 'Duration must be at least 1 minute.'
  if (!meeting.value.attendees.trim()) errors.value.attendees = 'Attendees are required.'
  if (!meeting.value.notes.trim()) errors.value.notes = 'Notes / Agenda is required.'

  // Date must be in the future
  if (meeting.value.datetime && new Date(meeting.value.datetime) <= new Date()) {
    errors.value.datetime = 'Date & Time must be in the future.'
  }

  // Validate attendees emails
  if (meeting.value.attendees) {
    const invalidEmails = meeting.value.attendees
      .split(',')
      .map((e) => e.trim())
      .filter((e) => !validateEmail(e))
    if (invalidEmails.length) {
      errors.value.attendees = `Invalid email(s): ${invalidEmails.join(', ')}`
    }
  }

  return Object.keys(errors.value).length === 0
}

// --------------------
// Submit Form
// --------------------
async function submitForm() {
  if (!validateForm()) return

  try {
    if (!store.token) {
      alert('⚠️ Please sign in with Google first!')
      return
    }

    if (!isGapiReady.value) {
      alert('⚠️ Google API not initialized yet. Please wait a moment and retry.')
      return
    }

    gapi.client.setToken({ access_token: store.token })

    const startTime = new Date(meeting.value.datetime)
    const endTime = new Date(startTime.getTime() + Number(meeting.value.duration) * 60000)

    const attendeesList = meeting.value.attendees
      .split(',')
      .map((email) => ({ email: email.trim() }))

    const event = {
      summary: meeting.value.title,
      description: meeting.value.notes,
      start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Kolkata' },
      attendees: attendeesList,
    }

    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    })

    alert('✅ Meeting scheduled successfully!')
    console.log('Google Calendar Event:', response.result)

    // Reset form
    meeting.value = { title: '', datetime: '', duration: '', attendees: '', notes: '' }
  } catch (error) {
    console.error('❌ Error adding event:', error)
    alert('Failed to add meeting. Please check console.')
  }
}

// --------------------
// Initialize gapi client
// --------------------
onMounted(async () => {
  try {
    await new Promise<void>((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          })
          isGapiReady.value = true
          console.log('✅ gapi.client initialized')
          resolve()
        } catch (err) {
          console.error('❌ gapi init error:', err)
          reject(err)
        }
      })
    })
  } catch (error) {
    console.error('❌ Failed to initialize Google API:', error)
  }
})
</script>

<style scoped></style>
