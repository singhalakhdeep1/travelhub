<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <span class="text-2xl font-bold text-blue-600">TravelHub</span>
          </div>
          <nav class="flex space-x-8">
            <NuxtLink to="/" class="text-gray-700 hover:text-blue-600">Home</NuxtLink>
            <NuxtLink to="/properties" class="text-gray-700 hover:text-blue-600">Properties</NuxtLink>
            <NuxtLink to="/auth/login" class="text-gray-700 hover:text-blue-600">Login</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">My Bookings</h2>

      <div v-if="bookingStore.isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading bookings...</p>
      </div>

      <div v-else-if="bookingStore.bookings.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
        <p class="text-gray-600 text-lg">No bookings found</p>
        <NuxtLink to="/properties" class="inline-block mt-4 text-blue-600 hover:text-blue-700">
          Browse properties
        </NuxtLink>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="booking in bookingStore.bookings"
          :key="booking.id"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-xl font-semibold mb-2">{{ booking.property?.title }}</h3>
              <div class="flex items-center text-gray-600 mb-2">
                <span>{{ booking.property?.city }}, {{ booking.property?.country }}</span>
              </div>
              <div class="flex items-center text-gray-600 mb-2">
                <span>
                  {{ new Date(booking.checkIn).toLocaleDateString() }} - {{ new Date(booking.checkOut).toLocaleDateString() }}
                </span>
              </div>
              <div class="mt-4">
                <span class="text-2xl font-bold text-blue-600">${{ booking.totalPrice }}</span>
                <span class="text-gray-600"> for {{ booking.guests }} guests</span>
              </div>
              <div class="mt-2">
                <span :class="getStatusClass(booking.status)">
                  {{ booking.status }}
                </span>
              </div>
            </div>
            <div class="ml-6">
              <button
                v-if="booking.status === 'PENDING' || booking.status === 'CONFIRMED'"
                @click="handleCancel(booking.id)"
                class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const bookingStore = useBookingStore()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.user) {
    bookingStore.fetchBookings({ userId: authStore.user.id })
  }
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium'
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium'
    case 'CANCELLED': return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium'
    default: return 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'
  }
}

const handleCancel = async (id: string) => {
  if (confirm('Are you sure you want to cancel this booking?')) {
    await bookingStore.cancelBooking(id)
  }
}
</script>
