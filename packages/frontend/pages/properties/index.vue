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
            <NuxtLink to="/bookings" class="text-gray-700 hover:text-blue-600">My Bookings</NuxtLink>
            <NuxtLink to="/auth/login" class="text-gray-700 hover:text-blue-600">Login</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">Available Properties</h2>

      <div v-if="propertyStore.isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading properties...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="property in propertyStore.properties"
          :key="property.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div class="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">{{ property.title }}</h3>
            <div class="flex items-center text-gray-600 mb-2">
              <span class="text-sm">{{ property.city }}, {{ property.country }}</span>
            </div>
            <div class="flex items-center text-gray-600 mb-2">
              <span class="text-sm">{{ property.maxGuests }} guests</span>
            </div>
            <div class="flex items-center text-gray-600 mb-4">
              <span class="text-sm">{{ property.rating }} ({{ property.reviewCount }} reviews)</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold text-blue-600">${{ property.price }}</span>
              <button
                @click="handleBook(property.id)"
                class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const propertyStore = usePropertyStore()
const authStore = useAuthStore()

onMounted(() => {
  propertyStore.fetchProperties({ status: 'AVAILABLE' })
})

const handleBook = (propertyId: string) => {
  if (!authStore.user) {
    navigateTo('/auth/login')
    return
  }
  navigateTo(`/properties/${propertyId}`)
}
</script>
