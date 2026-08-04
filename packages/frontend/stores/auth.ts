import { defineStore } from 'pinia'
import type { User, AuthResponse } from '~/types'
import { authApi } from '~/utils/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isLoading: false
  }),
  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const response = await authApi.login(email, password)
        localStorage.setItem('token', response.access_token)
        this.user = response.user
        this.token = response.access_token
      } finally {
        this.isLoading = false
      }
    },
    async register(data: any) {
      this.isLoading = true
      try {
        const response = await authApi.register(data)
        localStorage.setItem('token', response.access_token)
        this.user = response.user
        this.token = response.access_token
      } finally {
        this.isLoading = false
      }
    },
    logout() {
      localStorage.removeItem('token')
      this.user = null
      this.token = null
    },
    async fetchProfile() {
      this.isLoading = true
      try {
        this.user = await authApi.getProfile()
      } finally {
        this.isLoading = false
      }
    }
  },
  persist: true
})
