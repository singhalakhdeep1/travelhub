<template>
  <div class="ai-search">
    <div class="search-container">
      <input
        v-model="searchQuery"
        @input="debouncedSearch"
        placeholder="Describe your ideal property... (e.g., 'Hotels in Paris with gym and rooftop bar under $200')"
        class="search-input"
      />
      <div v-if="isLoading" class="loading-indicator">
        <span class="spinner"></span>
        Searching...
      </div>
    </div>
    
    <div v-if="extractedFilters" class="extracted-filters">
      <h4>Applied Filters:</h4>
      <div class="filter-tags">
        <span v-if="extractedFilters.location" class="filter-tag">
          📍 {{ extractedFilters.location }}
        </span>
        <span v-if="extractedFilters.minPrice" class="filter-tag">
          💰 ${{ extractedFilters.minPrice }}+
        </span>
        <span v-if="extractedFilters.maxPrice" class="filter-tag">
          💰 Under ${{ extractedFilters.maxPrice }}
        </span>
        <span v-if="extractedFilters.maxGuests" class="filter-tag">
          👥 {{ extractedFilters.maxGuests }}+ guests
        </span>
        <span v-if="extractedFilters.bedrooms" class="filter-tag">
          🛏️ {{ extractedFilters.bedrooms }}+ bedrooms
        </span>
        <span v-for="amenity in extractedFilters.amenities" :key="amenity" class="filter-tag">
          ✨ {{ amenity }}
        </span>
      </div>
    </div>
    
    <div v-if="results.length > 0" class="results-count">
      Found {{ results.length }} properties
    </div>
    
    <PropertyGrid v-if="results.length > 0" :properties="results" />
    
    <div v-if="!isLoading && results.length === 0 && searchQuery" class="no-results">
      <p>No properties match your search. Try different criteria.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')
const results = ref<any[]>([])
const extractedFilters = ref<any>(null)
const isLoading = ref(false)

const debouncedSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    results.value = []
    extractedFilters.value = null
    return
  }
  
  isLoading.value = true
  try {
    const response = await $fetch('/api/search/natural-language', {
      method: 'POST',
      body: { query: searchQuery.value }
    })
    results.value = (response as any).results
    extractedFilters.value = (response as any).extractedFilters
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    isLoading.value = false
  }
}, 500)
</script>

<style scoped>
.ai-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-container {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #6366f1;
}

.loading-indicator {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6366f1;
  font-size: 14px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #6366f1;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.extracted-filters {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.extracted-filters h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  background: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #374151;
  border: 1px solid #d1d5db;
}

.results-count {
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}
</style>
