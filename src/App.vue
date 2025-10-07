<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/useAuthStore'

const store = useAuthStore()
</script>

<template>
  <main>
    <Navbar></Navbar>
    <RouterView />
  </main>
</template>

<style scoped></style>
