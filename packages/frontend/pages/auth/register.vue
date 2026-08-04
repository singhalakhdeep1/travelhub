<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-blue-600 mb-8">TravelHub</h1>
      <h2 class="text-2xl font-semibold text-center text-gray-900 mb-6">Create Account</h2>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              v-model="formData.firstName"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              v-model="formData.lastName"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="formData.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            v-model="formData.password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minlength="8"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">I want to</label>
          <select
            v-model="formData.role"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GUEST">Book properties</option>
            <option value="HOST">List properties</option>
          </select>
        </div>
        
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {{ authStore.isLoading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
      
      <p class="mt-6 text-center text-gray-600">
        Already have an account?{' '}
        <NuxtLink to="/auth/login" class="text-blue-600 hover:text-blue-700">
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'GUEST'
})

const handleRegister = async () => {
  try {
    await authStore.register(formData.value)
    await navigateTo('/properties')
  } catch (error) {
    alert('Registration failed. Please try again.')
  }
}
</script>
