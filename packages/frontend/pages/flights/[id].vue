<template>
  <div class="flight-detail">
    <div v-if="loading" class="loading">Loading flight details...</div>
    <div v-else-if="flight" class="flight-content">
      <div class="flight-header">
        <h1>{{ flight.airline }} {{ flight.flightNumber }}</h1>
        <div class="route-badge">
          {{ flight.origin }} → {{ flight.destination }}
        </div>
      </div>

      <div class="flight-timeline">
        <div class="timeline-item">
          <div class="time">{{ flight.departureTime }}</div>
          <div class="airport">{{ flight.originAirport }}</div>
          <div class="date">{{ formatDate(flight.departureDate) }}</div>
        </div>
        <div class="timeline-arrow">
          <div class="duration">{{ flight.duration }}</div>
          <div class="stops">{{ flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}` }}</div>
        </div>
        <div class="timeline-item">
          <div class="time">{{ flight.arrivalTime }}</div>
          <div class="airport">{{ flight.destinationAirport }}</div>
          <div class="date">{{ formatDate(flight.arrivalDate) }}</div>
        </div>
      </div>

      <div class="flight-details">
        <div class="detail-section">
          <h3>Amenities</h3>
          <div class="amenities-list">
            <span v-for="amenity in flight.amenities" :key="amenity" class="amenity">
              ✓ {{ amenity }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <h3>Baggage Policy</h3>
          <div class="baggage-info">
            <div>Carry-on: {{ flight.baggage.carryOn }}</div>
            <div>Checked: {{ flight.baggage.checked }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Select Seats</h3>
          <div class="seat-selection">
            <button
              v-for="seat in availableSeats"
              :key="seat"
              :class="['seat', { selected: selectedSeat === seat }]"
              @click="selectedSeat = seat"
            >
              {{ seat }}
            </button>
          </div>
        </div>
      </div>

      <div class="booking-section">
        <div class="price-summary">
          <div class="price-row">
            <span>Base fare</span>
            <span>${{ flight.basePrice }}</span>
          </div>
          <div class="price-row">
            <span>Taxes & fees</span>
            <span>${{ flight.taxes }}</span>
          </div>
          <div class="price-row total">
            <span>Total</span>
            <span>${{ flight.totalPrice }}</span>
          </div>
        </div>
        <button @click="bookFlight" class="book-button">
          Book Flight
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const route = useRoute();
const loading = ref(true);
const flight = ref<any>(null);
const selectedSeat = ref<any>(null);
const availableSeats = ref(['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B']);

onMounted(async () => {
  // Mock data - in production, fetch from API
  setTimeout(() => {
    flight.value = {
      id: route.params.id,
      airline: 'Delta',
      flightNumber: 'DL1234',
      origin: 'JFK',
      originAirport: 'John F. Kennedy International',
      destination: 'LAX',
      destinationAirport: 'Los Angeles International',
      departureTime: '08:00',
      departureDate: '2024-03-15',
      arrivalTime: '11:30',
      arrivalDate: '2024-03-15',
      duration: '5h 30m',
      stops: 0,
      basePrice: 249,
      taxes: 50,
      totalPrice: 299,
      amenities: ['WiFi', 'Power outlets', 'In-flight entertainment', 'Meals'],
      baggage: { carryOn: '1 bag', checked: '1 bag included' },
    };
    loading.value = false;
  }, 500);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const bookFlight = () => {
  navigateTo(`/checkout?type=flight&id=${route.params.id}&seat=${selectedSeat.value}`);
};
</script>

<style scoped>
.flight-detail {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 40px;
}

.flight-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.flight-header h1 {
  margin: 0 0 10px 0;
}

.route-badge {
  background: #6366f1;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  display: inline-block;
}

.flight-timeline {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-item {
  text-align: center;
}

.timeline-item .time {
  font-size: 24px;
  font-weight: 700;
}

.timeline-item .airport {
  font-size: 18px;
  font-weight: 600;
  margin: 5px 0;
}

.timeline-item .date {
  color: #666;
  font-size: 14px;
}

.timeline-arrow {
  text-align: center;
  flex: 1;
  margin: 0 20px;
}

.duration {
  font-size: 16px;
  font-weight: 600;
}

.stops {
  color: #666;
  font-size: 14px;
}

.flight-details {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  margin-bottom: 15px;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.amenity {
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
}

.baggage-info div {
  margin-bottom: 5px;
}

.seat-selection {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.seat {
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
}

.seat.selected {
  border-color: #6366f1;
  background: #6366f1;
  color: white;
}

.booking-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.price-summary {
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.price-row.total {
  font-weight: 700;
  font-size: 18px;
  border-bottom: none;
  margin-top: 10px;
  padding-top: 15px;
}

.book-button {
  width: 100%;
  background: #6366f1;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>
