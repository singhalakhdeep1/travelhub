<template>
  <div class="co-host-search">
    <div class="filters">
      <input v-model="filters.location" placeholder="Location" class="filter-input" />
      <select v-model="filters.service" class="filter-select">
        <option value="">Service Type</option>
        <option value="full-management">Full Management</option>
        <option value="check-in-out">Check-in/out</option>
        <option value="cleaning">Cleaning</option>
        <option value="maintenance">Maintenance</option>
      </select>
      <select v-model="filters.availability" class="filter-select">
        <option value="">Availability</option>
        <option value="weekdays">Weekdays</option>
        <option value="weekends">Weekends</option>
        <option value="flexible">Flexible</option>
      </select>
      <button @click="search" class="search-btn">Search Co-Hosts</button>
    </div>
    
    <div v-if="loading" class="loading">Searching...</div>
    
    <div v-else-if="coHosts.length > 0" class="results">
      <div v-for="cohost in coHosts" :key="cohost.id" class="cohost-card">
        <img :src="cohost.user.avatar || '/default-avatar.png'" class="avatar" />
        <div class="info">
          <h3>{{ cohost.user.firstName }} {{ cohost.user.lastName }}</h3>
          <div class="rating">⭐ {{ cohost.rating.toFixed(1) }}</div>
          <div class="managed">{{ cohost.propertiesManaged }} properties managed</div>
          <div class="skills">
            <span v-for="skill in cohost.skills" :key="skill" class="skill-tag">{{ skill }}</span>
          </div>
          <div class="services">
            <span v-for="service in cohost.services" :key="service" class="service-tag">{{ service }}</span>
          </div>
          <div class="match">Match Score: {{ (cohost.matchScore * 100).toFixed(0) }}%</div>
          <div class="rates">
            <span v-if="cohost.rates.percentage">{{ cohost.rates.percentage * 100 }}% of bookings</span>
            <span v-if="cohost.rates.perBooking">${{ cohost.rates.perBooking }}/booking</span>
            <span v-if="cohost.rates.hourly">${{ cohost.rates.hourly }}/hour</span>
          </div>
          <button @click="hire(cohost)" class="hire-btn">Hire</button>
        </div>
      </div>
    </div>
    
    <div v-if="!loading && coHosts.length === 0 && hasSearched" class="no-results">
      <p>No co-hosts match your criteria. Try adjusting your filters.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const filters = ref({
  location: '',
  service: '',
  availability: ''
})
const coHosts = ref<any[]>([])
const loading = ref(false)
const hasSearched = ref(false)

const search = async () => {
  loading.value = true
  hasSearched.value = true
  try {
    coHosts.value = await $fetch('/api/co-hosts/search', {
      method: 'POST',
      body: filters.value
    })
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    loading.value = false
  }
}

const hire = async (cohost: any) => {
  const propertyId = useRoute().params.propertyId
  await $fetch('/api/co-hosts/hire', {
    method: 'POST',
    body: {
      hostId: useAuthStore().user?.id,
      coHostId: cohost.id,
      propertyId,
      terms: { type: 'percentage', value: 0.15 }
    }
  })
}
</script>

<style scoped>
.co-host-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-input, .filter-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.filter-input {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  min-width: 150px;
}

.search-btn {
  padding: 12px 24px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.results {
  display: grid;
  gap: 16px;
}

.cohost-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.info {
  flex: 1;
}

.info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #111827;
}

.rating {
  color: #f59e0b;
  font-weight: 600;
  margin-bottom: 8px;
}

.managed {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 12px;
}

.skills, .services {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.skill-tag, .service-tag {
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #374151;
}

.match {
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 12px;
}

.rates {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 12px;
}

.hire-btn {
  padding: 10px 20px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}
</style>
