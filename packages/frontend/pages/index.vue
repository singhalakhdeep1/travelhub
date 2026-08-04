<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <span class="text-2xl font-bold text-blue-600">TravelHub</span>
          </div>
          <nav class="flex space-x-8">
            <NuxtLink to="/properties" class="text-gray-700 hover:text-blue-600">Properties</NuxtLink>
            <NuxtLink to="/auth/login" class="text-gray-700 hover:text-blue-600">Login</NuxtLink>
            <NuxtLink to="/auth/register" class="text-blue-600 hover:text-blue-700 font-medium">Sign Up</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <h2 class="text-5xl font-bold text-gray-900 mb-6">
          Find Your Perfect Stay
        </h2>
        <p class="text-xl text-gray-600 mb-12">
          Discover amazing properties for your next trip
        </p>

        <NuxtLink
          to="/properties"
          class="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg inline-block"
        >
          Browse Properties
        </NuxtLink>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl">🏠</span>
          </div>
          <h3 class="text-xl font-semibold mb-2">Browse Properties</h3>
          <p class="text-gray-600">Find apartments, houses, and more</p>
        </div>
        <div class="text-center">
          <div class="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl">📅</span>
          </div>
          <h3 class="text-xl font-semibold mb-2">Easy Booking</h3>
          <p class="text-gray-600">Book your stay in seconds</p>
        </div>
        <div class="text-center">
          <div class="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl">⭐</span>
          </div>
          <h3 class="text-xl font-semibold mb-2">Trusted Reviews</h3>
          <p class="text-gray-600">Read reviews from other guests</p>
        </div>
      </div>
    </section>

    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <p>&copy; 2026 TravelHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
