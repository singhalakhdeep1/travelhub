<template>
  <div class="checkout-page">
    <div class="checkout-header">
      <h1>Complete Your Booking</h1>
      <div class="steps">
        <div :class="['step', { active: step >= 1, completed: step > 1 }]">
          <span class="step-number">1</span>
          <span class="step-label">Passenger Details</span>
        </div>
        <div :class="['step', { active: step >= 2, completed: step > 2 }]">
          <span class="step-number">2</span>
          <span class="step-label">Extras</span>
        </div>
        <div :class="['step', { active: step >= 3, completed: step > 3 }]">
          <span class="step-number">3</span>
          <span class="step-label">Payment</span>
        </div>
        <div :class="['step', { active: step >= 4 }]">
          <span class="step-number">4</span>
          <span class="step-label">Confirmation</span>
        </div>
      </div>
    </div>

    <div class="checkout-content">
      <div class="main-content">
        <!-- Step 1: Passenger Details -->
        <div v-if="step === 1" class="step-content">
          <h2>Passenger Details</h2>
          <form @submit.prevent="nextStep">
            <div v-for="(passenger, i) in booking.passengers" :key="i" class="passenger-card">
              <h3>Passenger {{ i + 1 }}</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input v-model="passenger.firstName" required />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input v-model="passenger.lastName" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input v-model="passenger.email" type="email" required />
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input v-model="passenger.phone" type="tel" required />
                </div>
              </div>
              <div class="form-group">
                <label>Date of Birth</label>
                <input v-model="passenger.dob" type="date" required />
              </div>
              <div class="form-group">
                <label>Passport Number</label>
                <input v-model="passenger.passport" required />
              </div>
            </div>
            <button type="submit">Continue to Extras</button>
          </form>
        </div>

        <!-- Step 2: Extras -->
        <div v-if="step === 2" class="step-content">
          <h2>Add Extras</h2>
          <div class="extras-list">
            <div v-for="extra in availableExtras" :key="extra.id" class="extra-item">
              <div class="extra-info">
                <h3>{{ extra.name }}</h3>
                <p>{{ extra.description }}</p>
              </div>
              <div class="extra-price">
                <span>${{ extra.price }}</span>
                <input type="checkbox" v-model="booking.extras" :value="extra.id" />
              </div>
            </div>
          </div>
          <div class="step-buttons">
            <button @click="prevStep" class="secondary">Back</button>
            <button @click="nextStep">Continue to Payment</button>
          </div>
        </div>

        <!-- Step 3: Payment -->
        <div v-if="step === 3" class="step-content">
          <h2>Payment Details</h2>
          <form @submit.prevent="processPayment">
            <div class="payment-methods">
              <button
                v-for="method in paymentMethods"
                :key="method.id"
                :class="['payment-method', { selected: booking.paymentMethod === method.id }]"
                @click="booking.paymentMethod = method.id"
                type="button"
              >
                {{ method.name }}
              </button>
            </div>

            <div v-if="booking.paymentMethod === 'card'" class="card-details">
              <div class="form-group">
                <label>Card Number</label>
                <input v-model="booking.card.number" placeholder="1234 5678 9012 3456" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Expiry</label>
                  <input v-model="booking.card.expiry" placeholder="MM/YY" required />
                </div>
                <div class="form-group">
                  <label>CVC</label>
                  <input v-model="booking.card.cvc" placeholder="123" required />
                </div>
              </div>
              <div class="form-group">
                <label>Cardholder Name</label>
                <input v-model="booking.card.name" required />
              </div>
            </div>

            <div class="step-buttons">
              <button type="button" @click="prevStep" class="secondary">Back</button>
              <button type="submit" :disabled="processing">
                {{ processing ? 'Processing...' : 'Pay Now' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Step 4: Confirmation -->
        <div v-if="step === 4" class="step-content">
          <div class="confirmation">
            <div class="success-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p>Your booking has been successfully processed.</p>
            <div class="booking-reference">
              <strong>Reference:</strong> {{ bookingReference }}
            </div>
            <div class="confirmation-details">
              <p>A confirmation email has been sent to your email address.</p>
              <p>You can view your booking details in My Trips.</p>
            </div>
            <button @click="goToTrips">View My Trips</button>
          </div>
        </div>
      </div>

      <!-- Order Summary Sidebar -->
      <div class="order-summary">
        <h3>Order Summary</h3>
        <div class="summary-item">
          <span>{{ bookingType }}</span>
          <span>${{ basePrice }}</span>
        </div>
        <div v-if="booking.extras.length > 0" class="extras-summary">
          <div v-for="extraId in booking.extras" :key="extraId" class="summary-item">
            <span>{{ getExtraName(extraId) }}</span>
            <span>${{ getExtraPrice(extraId) }}</span>
          </div>
        </div>
        <div class="summary-item">
          <span>Taxes & fees</span>
          <span>${{ taxes }}</span>
        </div>
        <div class="summary-item total">
          <span>Total</span>
          <span>${{ total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const route = useRoute();
const step = ref(1);
const processing = ref(false);
const bookingReference = ref('');

const booking = ref({
  passengers: [{ firstName: '', lastName: '', email: '', phone: '', dob: '', passport: '' }],
  extras: [],
  paymentMethod: 'card',
  card: { number: '', expiry: '', cvc: '', name: '' },
});

const availableExtras = ref([
  { id: 'insurance', name: 'Travel Insurance', description: 'Comprehensive coverage', price: 49 },
  { id: 'seat', name: 'Seat Selection', description: 'Choose your preferred seat', price: 25 },
  { id: 'meal', name: 'Premium Meal', description: 'Gourmet in-flight meal', price: 35 },
  { id: 'lounge', name: 'Airport Lounge', description: 'Access to VIP lounge', price: 75 },
]);

const paymentMethods = ref([
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'applepay', name: 'Apple Pay' },
]);

const bookingType = computed(() => {
  const type = route.query.type;
  return type === 'flight' ? 'Flight' : type === 'hotel' ? 'Hotel' : 'Package';
});

const basePrice = computed(() => 299);
const taxes = computed(() => Math.round(basePrice.value * 0.15));
const total = computed(() => {
  const extrasTotal = booking.value.extras.reduce((sum, id) => sum + getExtraPrice(id), 0);
  return basePrice.value + taxes.value + extrasTotal;
});

const nextStep = () => {
  if (step.value < 4) step.value++;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const processPayment = async () => {
  processing.value = true;
  setTimeout(() => {
    bookingReference.value = 'TRV' + Date.now().toString().slice(-8);
    processing.value = false;
    step.value = 4;
  }, 2000);
};

const getExtraName = (id: string) => {
  return availableExtras.value.find(e => e.id === id)?.name || '';
};

const getExtraPrice = (id: string) => {
  return availableExtras.value.find(e => e.id === id)?.price || 0;
};

const goToTrips = () => {
  navigateTo('/my-trips');
};
</script>

<style scoped>
.checkout-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  margin-bottom: 30px;
}

.checkout-header h1 {
  margin: 0 0 20px 0;
}

.steps {
  display: flex;
  justify-content: space-between;
  max-width: 600px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  opacity: 0.5;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step.active .step-number {
  background: #6366f1;
  color: white;
}

.step.completed .step-number {
  background: #22c55e;
  color: white;
}

.step-label {
  font-size: 12px;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.step-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
}

.step-content h2 {
  margin-bottom: 20px;
}

.passenger-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.passenger-card h3 {
  margin-top: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
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

.extras-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.extra-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.extra-price {
  display: flex;
  align-items: center;
  gap: 15px;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.payment-method {
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.payment-method.selected {
  border-color: #6366f1;
  background: #f0f0ff;
}

.card-details {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
}

.step-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.step-buttons button {
  flex: 1;
}

.secondary {
  background: #6b7280;
}

.confirmation {
  text-align: center;
  padding: 40px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 20px;
}

.booking-reference {
  background: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 18px;
}

.confirmation-details p {
  color: #666;
  margin: 10px 0;
}

.order-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.order-summary h3 {
  margin-bottom: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.summary-item.total {
  font-weight: 700;
  font-size: 18px;
  border-bottom: none;
  margin-top: 15px;
  padding-top: 15px;
}
</style>
