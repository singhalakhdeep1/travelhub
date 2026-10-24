<template>
  <div class="hotel-detail">
    <div v-if="loading" class="loading">Loading hotel details...</div>
    <div v-else-if="hotel" class="hotel-content">
      <div class="gallery">
        <img :src="hotel.image" :alt="hotel.name" class="main-image" />
        <div class="thumbnails">
          <img v-for="(img, i) in hotel.images" :key="i" :src="img" class="thumbnail" />
        </div>
      </div>

      <div class="hotel-header">
        <h1>{{ hotel.name }}</h1>
        <div class="rating">
          <span v-for="i in hotel.stars" :key="i" class="star">★</span>
          <span class="rating-score">{{ hotel.rating }}/5</span>
        </div>
        <div class="location">{{ hotel.location }}</div>
      </div>

      <div class="hotel-sections">
        <div class="section">
          <h3>About</h3>
          <p>{{ hotel.description }}</p>
        </div>

        <div class="section">
          <h3>Amenities</h3>
          <div class="amenities-grid">
            <div v-for="amenity in hotel.amenities" :key="amenity" class="amenity-item">
              <span class="icon">✓</span>
              {{ amenity }}
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Rooms</h3>
          <div class="rooms-list">
            <div v-for="room in hotel.rooms" :key="room.id" class="room-card">
              <div class="room-info">
                <h4>{{ room.name }}</h4>
                <p>{{ room.description }}</p>
                <div class="room-amenities">
                  <span v-for="a in room.amenities" :key="a">{{ a }}</span>
                </div>
              </div>
              <div class="room-price">
                <div class="price">${{ room.price }}<span>/night</span></div>
                <button @click="selectRoom(room)" :class="{ selected: selectedRoom?.id === room.id }">
                  {{ selectedRoom?.id === room.id ? 'Selected' : 'Select' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Reviews</h3>
          <div class="reviews-list">
            <div v-for="review in hotel.reviews" :key="review.id" class="review-card">
              <div class="review-header">
                <span class="reviewer">{{ review.author }}</span>
                <span class="review-rating">{{ review.rating }}/5</span>
              </div>
              <p class="review-text">{{ review.text }}</p>
              <span class="review-date">{{ formatDate(review.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="booking-sidebar">
        <div class="booking-card">
          <div class="dates">
            <div class="date-input">
              <label>Check-in</label>
              <input v-model="booking.checkIn" type="date" />
            </div>
            <div class="date-input">
              <label>Check-out</label>
              <input v-model="booking.checkOut" type="date" />
            </div>
          </div>
          <div class="guests">
            <label>Guests</label>
            <input v-model="booking.guests" type="number" min="1" />
          </div>
          <div class="price-summary">
            <div class="price-row">
              <span>{{ nights }} nights × ${{ selectedRoom?.price || hotel.price }}</span>
              <span>${{ calculateTotal() }}</span>
            </div>
            <div class="price-row">
              <span>Taxes & fees</span>
              <span>${{ calculateTaxes() }}</span>
            </div>
            <div class="price-row total">
              <span>Total</span>
              <span>${{ calculateTotal() + calculateTaxes() }}</span>
            </div>
          </div>
          <button @click="bookHotel" class="book-button" :disabled="!selectedRoom">
            Book Now
          </button>
          <div v-if="hotel.freeCancellation" class="free-cancellation">
            ✓ Free cancellation
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const route = useRoute();
const loading = ref(true);
const hotel = ref<any>(null);
const selectedRoom = ref<any>(null);
const booking = ref({
  checkIn: '',
  checkOut: '',
  guests: 1,
});

const nights = computed(() => {
  if (!booking.value.checkIn || !booking.value.checkOut) return 1;
  const start = new Date(booking.value.checkIn);
  const end = new Date(booking.value.checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
});

onMounted(async () => {
  setTimeout(() => {
    hotel.value = {
      id: route.params.id,
      name: 'Grand Hotel',
      location: 'Downtown, City Center',
      stars: 5,
      rating: 4.8,
      image: '/hotel1.jpg',
      images: ['/hotel1.jpg', '/hotel2.jpg', '/hotel3.jpg'],
      description: 'Luxury hotel in the heart of downtown with stunning city views and world-class amenities.',
      amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Parking', 'Breakfast', 'Room Service'],
      rooms: [
        { id: '1', name: 'Standard Room', description: 'Comfortable room with city view', price: 299, amenities: ['WiFi', 'TV', 'AC'] },
        { id: '2', name: 'Deluxe Suite', description: 'Spacious suite with separate living area', price: 449, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'] },
        { id: '3', name: 'Presidential Suite', description: 'Ultimate luxury experience', price: 799, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Butler Service'] },
      ],
      reviews: [
        { id: '1', author: 'John D.', rating: 5, text: 'Amazing experience! Staff was incredibly helpful.', date: '2024-02-15' },
        { id: '2', author: 'Sarah M.', rating: 4, text: 'Great location and beautiful rooms.', date: '2024-02-10' },
      ],
      freeCancellation: true,
    };
    loading.value = false;
  }, 500);
});

const selectRoom = (room: any) => {
  selectedRoom.value = room;
};

const calculateTotal = () => {
  const price = selectedRoom.value?.price || hotel.value?.price || 0;
  return price * nights.value;
};

const calculateTaxes = () => {
  return Math.round(calculateTotal() * 0.15);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const bookHotel = () => {
  navigateTo(`/checkout?type=hotel&id=${route.params.id}&roomId=${selectedRoom.value?.id}`);
};
</script>

<style scoped>
.hotel-detail {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 40px;
}

.gallery {
  margin-bottom: 20px;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.thumbnails {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.thumbnail {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.hotel-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.hotel-header h1 {
  margin: 0 0 10px 0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.star {
  color: #fbbf24;
}

.rating-score {
  font-weight: 600;
}

.location {
  color: #666;
}

.hotel-sections {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
}

.section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.section h3 {
  margin-bottom: 15px;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  color: #22c55e;
  font-weight: bold;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.room-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-amenities {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.room-amenities span {
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.room-price {
  text-align: right;
}

.room-price .price {
  font-size: 20px;
  font-weight: 700;
  color: #6366f1;
}

.room-price button {
  margin-top: 10px;
  padding: 8px 16px;
}

.room-price button.selected {
  background: #22c55e;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-card {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.reviewer {
  font-weight: 600;
}

.review-rating {
  color: #fbbf24;
}

.review-text {
  color: #333;
  margin: 5px 0;
}

.review-date {
  color: #999;
  font-size: 12px;
}

.booking-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.booking-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.date-input label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #666;
}

.date-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.guests {
  margin-bottom: 15px;
}

.guests label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #666;
}

.guests input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.price-summary {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  margin-bottom: 15px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.price-row.total {
  font-weight: 700;
  font-size: 18px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
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

.book-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.free-cancellation {
  text-align: center;
  color: #22c55e;
  font-size: 14px;
  margin-top: 10px;
}
</style>
