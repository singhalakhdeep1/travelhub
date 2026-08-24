<template>
  <div class="packages-page">
    <div class="hero">
      <h1>Travel Packages</h1>
      <p>Save more with flight + hotel bundles</p>
    </div>

    <div class="search-form">
      <form @submit.prevent="searchPackages">
        <div class="form-row">
          <div class="form-group">
            <label>Destination</label>
            <input v-model="search.destination" type="text" placeholder="Where to?" />
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
            <label>Travelers</label>
            <input v-model="search.travelers" type="number" min="1" value="1" />
          </div>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Searching...' : 'Search Packages' }}
        </button>
      </form>
    </div>

    <div v-if="results.length > 0" class="results">
      <div class="savings-banner">
        💰 Save up to 30% when you book together!
      </div>

      <div class="packages-list">
        <div v-for="pkg in results" :key="pkg.id" class="package-card">
          <div class="package-images">
            <img :src="pkg.hotel.image" :alt="pkg.hotel.name" class="hotel-img" />
            <div class="flight-info">
              <div class="airline">{{ pkg.flight.airline }}</div>
              <div class="route">{{ pkg.flight.origin }} → {{ pkg.flight.destination }}</div>
            </div>
          </div>

          <div class="package-details">
            <h3>{{ pkg.hotel.name }}</h3>
            <div class="location">{{ pkg.hotel.location }}</div>
            <div class="rating">
              <span v-for="i in pkg.hotel.stars" :key="i">★</span>
              <span class="score">{{ pkg.hotel.rating }}/5</span>
            </div>

            <div class="package-includes">
              <div class="include-item">
                <span class="icon">✈️</span>
                <span>Round-trip flight</span>
              </div>
              <div class="include-item">
                <span class="icon">🏨</span>
                <span>{{ pkg.nights }} nights hotel</span>
              </div>
              <div class="include-item" v-if="pkg.includesBreakfast">
                <span class="icon">🍳</span>
                <span>Breakfast included</span>
              </div>
            </div>
          </div>

          <div class="package-price">
            <div class="original-price">${{ pkg.originalPrice }}</div>
            <div class="discount">{{ pkg.discountPercent }}% off</div>
            <div class="final-price">${{ pkg.price }}</div>
            <div class="savings">You save ${{ pkg.savings }}</div>
            <button @click="selectPackage(pkg)">Book Package</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const search = ref({
  destination: '',
  checkIn: '',
  checkOut: '',
  travelers: 1,
});

const loading = ref(false);
const results = ref([]);

const searchPackages = async () => {
  loading.value = true;
  setTimeout(() => {
    results.value = [
      {
        id: '1',
        hotel: {
          name: 'Grand Resort',
          location: 'Beachfront, Miami',
          stars: 5,
          rating: 4.9,
          image: '/resort1.jpg',
        },
        flight: {
          airline: 'Delta',
          origin: 'JFK',
          destination: 'MIA',
        },
        nights: 5,
        includesBreakfast: true,
        originalPrice: 2499,
        discountPercent: 25,
        price: 1874,
        savings: 625,
      },
      {
        id: '2',
        hotel: {
          name: 'City Center Hotel',
          location: 'Downtown, Chicago',
          stars: 4,
          rating: 4.6,
          image: '/hotel2.jpg',
        },
        flight: {
          airline: 'United',
          origin: 'LAX',
          destination: 'ORD',
        },
        nights: 3,
        includesBreakfast: false,
        originalPrice: 1299,
        discountPercent: 20,
        price: 1039,
        savings: 260,
      },
    ];
    loading.value = false;
  }, 1000);
};

const selectPackage = (pkg: any) => {
  navigateTo('/checkout', { query: { type: 'package', id: pkg.id } });
};
</script>

<style scoped>
.packages-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 20px;
}

.hero h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
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
  width: 100%;
}

.savings-banner {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
}

.packages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.package-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.package-images {
  width: 300px;
  position: relative;
}

.hotel-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.flight-info {
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 10px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.airline {
  font-weight: 600;
}

.route {
  font-size: 14px;
}

.package-details {
  flex: 1;
  padding: 20px;
}

.package-details h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
}

.location {
  color: #666;
  margin-bottom: 10px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.rating .star {
  color: #fbbf24;
}

.rating .score {
  font-weight: 600;
}

.package-includes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.include-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.package-price {
  width: 200px;
  padding: 20px;
  text-align: center;
  background: #f8fafc;
  border-left: 1px solid #eee;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 16px;
}

.discount {
  color: #ef4444;
  font-weight: 700;
  margin: 5px 0;
}

.final-price {
  font-size: 32px;
  font-weight: 700;
  color: #6366f1;
  margin: 5px 0;
}

.savings {
  color: #22c55e;
  font-weight: 600;
  margin-bottom: 15px;
}

.package-price button {
  width: 100%;
}
</style>
