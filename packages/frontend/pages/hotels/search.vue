<template>
  <div class="hotels-search">
    <div class="search-form">
      <h2>Search Hotels</h2>
      <form @submit.prevent="searchHotels">
        <div class="form-group">
          <label>Destination</label>
          <input v-model="search.destination" type="text" placeholder="City or hotel name" />
        </div>
        <div class="form-group">
          <label>Check-in</label>
          <input v-model="search.checkIn" type="date" />
        </div>
        <div class="form-group">
          <label>Check-out</label>
          <input v-model="search.checkOut" type="date" />
        </div>
        <div class="form-group">
          <label>Guests</label>
          <input v-model="search.guests" type="number" min="1" value="1" />
        </div>
        <div class="form-group">
          <label>Rooms</label>
          <input v-model="search.rooms" type="number" min="1" value="1" />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Searching...' : 'Search Hotels' }}
        </button>
      </form>
    </div>

    <div v-if="results.length > 0" class="results">
      <div class="view-toggle">
        <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">List</button>
        <button :class="{ active: viewMode === 'map' }" @click="viewMode = 'map'">Map</button>
      </div>

      <div class="filters">
        <h3>Filters</h3>
        <div class="filter-group">
          <label>Price Range</label>
          <div class="price-range">
            <input v-model="filters.minPrice" type="number" placeholder="Min" />
            <input v-model="filters.maxPrice" type="number" placeholder="Max" />
          </div>
        </div>
        <div class="filter-group">
          <label>Star Rating</label>
          <select v-model="filters.stars">
            <option value="any">Any</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Amenities</label>
          <div class="amenities-filter">
            <label v-for="amenity in allAmenities" :key="amenity">
              <input type="checkbox" v-model="filters.amenities" :value="amenity" />
              {{ amenity }}
            </label>
          </div>
        </div>
        <div class="filter-group">
          <label>Free Cancellation</label>
          <input type="checkbox" v-model="filters.freeCancellation" />
        </div>
      </div>

      <div v-if="viewMode === 'list'" class="hotel-list">
        <div v-for="hotel in filteredHotels" :key="hotel.id" class="hotel-card">
          <img :src="hotel.image" :alt="hotel.name" class="hotel-image" />
          <div class="hotel-info">
            <div class="hotel-name">{{ hotel.name }}</div>
            <div class="hotel-rating">
              <span v-for="i in hotel.stars" :key="i">★</span>
            </div>
            <div class="hotel-location">{{ hotel.location }}</div>
            <div class="hotel-amenities">
              <span v-for="amenity in hotel.amenities.slice(0, 3)" :key="amenity" class="amenity-tag">
                {{ amenity }}
              </span>
            </div>
            <div class="hotel-rating-score">Rating: {{ hotel.rating }}/5</div>
          </div>
          <div class="hotel-price">
            <div class="price">${{ hotel.price }}<span>/night</span></div>
            <div class="total">${{ calculateTotal(hotel.price) }} total</div>
            <button @click="selectHotel(hotel)">View Details</button>
          </div>
        </div>
      </div>

      <div v-else class="map-view">
        <div class="map-placeholder">
          <p>Map view - hotels displayed on map</p>
          <div v-for="hotel in filteredHotels" :key="hotel.id" class="map-marker">
            ${{ hotel.price }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const search = ref({
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  rooms: 1,
});

const filters = ref({
  minPrice: null,
  maxPrice: null,
  stars: 'any',
  amenities: [],
  freeCancellation: false,
});

const viewMode = ref('list');
const loading = ref(false);
const results = ref([]);
const allAmenities = ref(['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Parking', 'Breakfast']);

const filteredHotels = computed(() => {
  return results.value.filter((hotel: any) => {
    if (filters.value.minPrice && hotel.price < filters.value.minPrice) return false;
    if (filters.value.maxPrice && hotel.price > filters.value.maxPrice) return false;
    if (filters.value.stars !== 'any' && hotel.stars < parseInt(filters.value.stars)) return false;
    if (filters.value.freeCancellation && !hotel.freeCancellation) return false;
    if (filters.value.amenities.length > 0) {
      const hasAllAmenities = filters.value.amenities.every((a: string) => hotel.amenities.includes(a));
      if (!hasAllAmenities) return false;
    }
    return true;
  });
});

const searchHotels = async () => {
  loading.value = true;
  setTimeout(() => {
    results.value = [
      {
        id: '1',
        name: 'Grand Hotel',
        location: 'Downtown',
        stars: 5,
        price: 299,
        rating: 4.8,
        image: '/hotel1.jpg',
        amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant'],
        freeCancellation: true,
      },
      {
        id: '2',
        name: 'City Inn',
        location: 'Midtown',
        stars: 4,
        price: 179,
        rating: 4.5,
        image: '/hotel2.jpg',
        amenities: ['WiFi', 'Breakfast', 'Parking'],
        freeCancellation: false,
      },
    ];
    loading.value = false;
  }, 1000);
};

const calculateTotal = (price: number) => {
  const nights = 3; // Calculate from check-in/check-out dates
  return price * nights;
};

const selectHotel = (hotel: any) => {
  navigateTo(`/hotels/${hotel.id}`);
};
</script>

<style scoped>
.hotels-search {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #6366f1;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.results {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
}

.view-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.view-toggle button {
  flex: 1;
  padding: 10px;
}

.view-toggle button.active {
  background: #6366f1;
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.filter-group {
  margin-bottom: 15px;
}

.price-range {
  display: flex;
  gap: 10px;
}

.amenities-filter label {
  display: block;
  margin-bottom: 5px;
}

.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.hotel-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  gap: 20px;
}

.hotel-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.hotel-info {
  flex: 1;
}

.hotel-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.hotel-rating {
  color: #fbbf24;
  margin-bottom: 5px;
}

.hotel-location {
  color: #666;
  margin-bottom: 10px;
}

.hotel-amenities {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.amenity-tag {
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.hotel-rating-score {
  color: #666;
  font-size: 14px;
}

.hotel-price {
  text-align: right;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #6366f1;
}

.price span {
  font-size: 14px;
  font-weight: 400;
}

.total {
  color: #666;
  margin-bottom: 10px;
}

.map-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-height: 400px;
}

.map-placeholder {
  text-align: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 8px;
}

.map-marker {
  display: inline-block;
  background: #6366f1;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  margin: 5px;
}
</style>
