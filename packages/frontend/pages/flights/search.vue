<template>
  <div class="flights-search">
    <div class="search-form">
      <h2>Search Flights</h2>
      <form @submit.prevent="searchFlights">
        <div class="form-group">
          <label>From</label>
          <input v-model="search.origin" type="text" placeholder="Origin city or airport" />
        </div>
        <div class="form-group">
          <label>To</label>
          <input v-model="search.destination" type="text" placeholder="Destination city or airport" />
        </div>
        <div class="form-group">
          <label>Departure Date</label>
          <input v-model="search.date" type="date" />
        </div>
        <div class="form-group">
          <label>Return Date</label>
          <input v-model="search.returnDate" type="date" />
        </div>
        <div class="form-group">
          <label>Passengers</label>
          <input v-model="search.passengers" type="number" min="1" value="1" />
        </div>
        <div class="form-group">
          <label>Cabin Class</label>
          <select v-model="search.cabin">
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Searching...' : 'Search Flights' }}
        </button>
      </form>
    </div>

    <div v-if="results.length > 0" class="results">
      <div class="filters">
        <h3>Filters</h3>
        <div class="filter-group">
          <label>Stops</label>
          <select v-model="filters.stops">
            <option value="any">Any</option>
            <option value="0">Non-stop</option>
            <option value="1">1 Stop</option>
            <option value="2">2+ Stops</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Airline</label>
          <select v-model="filters.airline">
            <option value="any">Any</option>
            <option v-for="airline in airlines" :key="airline" :value="airline">{{ airline }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Max Price</label>
          <input v-model="filters.maxPrice" type="number" />
        </div>
      </div>

      <div class="flight-list">
        <div v-for="flight in filteredFlights" :key="flight.id" class="flight-card">
          <div class="flight-info">
            <div class="airline">{{ flight.airline }}</div>
            <div class="route">
              <span class="time">{{ flight.departureTime }}</span>
              <span class="airport">{{ flight.origin }}</span>
              <span class="arrow">→</span>
              <span class="time">{{ flight.arrivalTime }}</span>
              <span class="airport">{{ flight.destination }}</span>
            </div>
            <div class="details">
              <span>Duration: {{ flight.duration }}</span>
              <span>Stops: {{ flight.stops }}</span>
            </div>
          </div>
          <div class="flight-price">
            <div class="price">${{ flight.price }}</div>
            <button @click="selectFlight(flight)">Select</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const search = ref({
  origin: '',
  destination: '',
  date: '',
  returnDate: '',
  passengers: 1,
  cabin: 'economy',
});

const filters = ref({
  stops: 'any',
  airline: 'any',
  maxPrice: null,
});

const loading = ref(false);
const results = ref([]);
const airlines = ref(['Delta', 'United', 'American', 'Southwest', 'JetBlue']);

const filteredFlights = computed(() => {
  return results.value.filter((flight: any) => {
    if (filters.value.stops !== 'any' && flight.stops !== parseInt(filters.value.stops)) {
      return false;
    }
    if (filters.value.airline !== 'any' && flight.airline !== filters.value.airline) {
      return false;
    }
    if (filters.value.maxPrice && flight.price > filters.value.maxPrice) {
      return false;
    }
    return true;
  });
});

const searchFlights = async () => {
  loading.value = true;
  // Mock search - in production, call API
  setTimeout(() => {
    results.value = [
      {
        id: '1',
        airline: 'Delta',
        origin: 'JFK',
        destination: 'LAX',
        departureTime: '08:00',
        arrivalTime: '11:30',
        duration: '5h 30m',
        stops: 0,
        price: 299,
      },
      {
        id: '2',
        airline: 'United',
        origin: 'JFK',
        destination: 'LAX',
        departureTime: '10:00',
        arrivalTime: '14:15',
        duration: '6h 15m',
        stops: 1,
        price: 249,
      },
    ];
    loading.value = false;
  }, 1000);
};

const selectFlight = (flight: any) => {
  navigateTo(`/flights/${flight.id}`);
};
</script>

<style scoped>
.flights-search {
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

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.results {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.filter-group {
  margin-bottom: 15px;
}

.flight-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.flight-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flight-info {
  flex: 1;
}

.airline {
  font-weight: 600;
  margin-bottom: 10px;
}

.route {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.details {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.flight-price {
  text-align: right;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 10px;
}
</style>
