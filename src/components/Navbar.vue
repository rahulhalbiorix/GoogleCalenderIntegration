<script setup lang="ts">
import router from '@/router'
import { useAuthStore } from '@/stores/useAuthStore'

const store = useAuthStore()
</script>

<template>
  <nav class="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
    <h1 class="text-2xl font-bold tracking-wide">Meeting App</h1>

    <div class="space-x-4">
      <button
        class="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
        @click="router.push({ name: 'dashboard' })"
        v-if="store.isUserLoggedIn"
      >
        Dashboard
      </button>

      <button
        class="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
        @click="router.push({ name: 'MeetingForm' })"
        v-if="store.isUserLoggedIn"
      >
        Schedule Meetings
      </button>
    </div>
  </nav>
</template>
