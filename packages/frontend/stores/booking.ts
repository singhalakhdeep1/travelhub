import { defineStore } from 'pinia'
import type { Booking } from '~/types'
import { bookingsApi } from '~/utils/api'

export const useBookingStore = defineStore('booking', {
  state: () => ({
    bookings: [] as Booking[],
    selectedBooking: null as Booking | null,
    isLoading: false
  }),
  actions: {
    async fetchBookings(filters?: any) {
      this.isLoading = true
      try {
        this.bookings = await bookingsApi.getAll(filters)
      } finally {
        this.isLoading = false
      }
    },
    async fetchBookingById(id: string) {
      this.isLoading = true
      try {
        this.selectedBooking = await bookingsApi.getById(id)
      } finally {
        this.isLoading = false
      }
    },
    async createBooking(data: any) {
      this.isLoading = true
      try {
        const booking = await bookingsApi.create(data)
        this.bookings.push(booking)
      } finally {
        this.isLoading = false
      }
    },
    async cancelBooking(id: string) {
      this.isLoading = true
      try {
        const booking = await bookingsApi.cancel(id)
        const index = this.bookings.findIndex(b => b.id === id)
        if (index !== -1) {
          this.bookings[index] = booking
        }
      } finally {
        this.isLoading = false
      }
    }
  }
})
