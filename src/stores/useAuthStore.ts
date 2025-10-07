import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore(
  'authStore',
  () => {
    const token = ref<string>('')
    const isUserLoggedIn = ref<boolean>(false)

    const SetToken = (val: string) => {
      token.value = val
      isUserLoggedIn.value = true
    }

    const resetUser = () => {
      token.value = ''
      isUserLoggedIn.value = false
    }

    return { token, isUserLoggedIn, SetToken, resetUser }
  },
  {
    persist: true,
  },
)
