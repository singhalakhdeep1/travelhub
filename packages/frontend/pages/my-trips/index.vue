<template>
  <div class="my-trips-page">
    <div class="tabs">
      <button :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">Upcoming</button>
      <button :class="{ active: activeTab === 'past' }" @click="activeTab = 'past'">Past</button>
      <button :class="{ active: activeTab === 'cancelled' }" @click="activeTab = 'cancelled'">Cancelled</button>
    </div>

    <div v-if="loading" class="loading">Loading trips...</div>
    <div v-else-if="filteredTrips.length === 0" class="empty-state">
      <p>No {{ activeTab }} trips found</p>
      <button @click="navigateTo('/')">Book a Trip</button>
    </div>
    <div v-else class="trips-list">
      <div v-for="trip in filteredTrips" :key="trip.id" class="trip-card">
        <div class="trip-header">
          <div class="trip-type">{{ trip.type }}</div>
          <div class="trip-status" :class="trip.status.toLowerCase()">{{ trip.status }}</div>
        </div>

        <div class="trip-details">
          <div class="trip-destination">
            <h3>{{ trip.destination }}</h3>
            <p>{{ trip.dates }}</p>
          </div>

          <div class="trip-info">
            <div class="info-item">
              <span class="label">Reference:</span>
              <span class="value">{{ trip.reference }}</span>
            </div>
            <div class="info-item">
              <span class="label">Travelers:</span>
              <span class="value">{{ trip.travelers }}</span>
            </div>
            <div class="info-item">
              <span class="label">Total:</span>
              <span class="value">${{ trip.total }}</span>
            </div>
          </div>
        </div>

        <div class="trip-actions">
          <button @click="viewTrip(trip)" class="primary">View Details</button>
          <button v-if="trip.status === 'Upcoming'" @click="cancelTrip(trip)" class="secondary">Cancel</button>
          <button v-if="trip.status === 'Past'" @click="bookAgain(trip)" class="secondary">Book Again</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const activeTab = ref('upcoming');
const loading = ref(true);
const trips = ref<any[]>([]);

const filteredTrips = computed(() => {
  return trips.value.filter((trip: any) => {
    if (activeTab.value === 'upcoming') return trip.status === 'Upcoming';
    if (activeTab.value === 'past') return trip.status === 'Completed';
    if (activeTab.value === 'cancelled') return trip.status === 'Cancelled';
    return true;
  });
});

onMounted(async () => {
  setTimeout(() => {
    trips.value = [
      {
        id: '1',
        type: 'Flight + Hotel',
        destination: 'Miami, Florida',
        dates: 'Mar 15 - Mar 20, 2024',
        reference: 'TRV12345678',
        travelers: 2,
        total: 1874,
        status: 'Upcoming',
      },
      {
        id: '2',
        type: 'Flight',
        destination: 'New York, NY',
        dates: 'Feb 10 - Feb 12, 2024',
        reference: 'TRV87654321',
        travelers: 1,
        total: 299,
        status: 'Completed',
      },
      {
        id: '3',
        type: 'Hotel',
        destination: 'Chicago, IL',
        dates: 'Jan 5 - Jan 8, 2024',
        reference: 'TRV11223344',
        travelers: 2,
        total: 537,
        status: 'Cancelled',
      },
    ];
    loading.value = false;
  }, 500);
});

const viewTrip = (trip: any) => {
  navigateTo(`/my-trips/${trip.id}`);
};

const cancelTrip = (trip: any) => {
  if (confirm('Are you sure you want to cancel this trip?')) {
    // In production, call API to cancel
    alert('Trip cancelled successfully');
  }
};

const bookAgain = (trip: any) => {
  navigateTo('/');
};
</script>

<style scoped>
.my-trips-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.tabs button.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.loading {
  text-align: center;
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

.trips-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.trip-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.trip-type {
  font-weight: 600;
  color: #6366f1;
}

.trip-status {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.trip-status.upcoming {
  background: #dbeafe;
  color: #1d4ed8;
}

.trip-status.completed {
  background: #dcfce7;
  color: #16a34a;
}

.trip-status.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.trip-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.trip-destination h3 {
  margin: 0 0 5px 0;
}

.trip-destination p {
  color: #666;
  margin: 0;
}

.trip-info {
  text-align: right;
}

.info-item {
  margin-bottom: 5px;
}

.info-item .label {
  color: #666;
  margin-right: 10px;
}

.info-item .value {
  font-weight: 600;
}

.trip-actions {
  display: flex;
  gap: 10px;
}

.trip-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  background: #6366f1;
  color: white;
}

.secondary {
  background: #6b7280;
  color: white;
}
</style>
