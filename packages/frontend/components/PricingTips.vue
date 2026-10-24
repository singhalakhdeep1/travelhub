<template>
  <div class="pricing-tips">
    <div v-if="loading" class="loading">Loading pricing recommendations...</div>
    
    <div v-else-if="tips" class="tips-content">
      <div class="current-price">
        <h3>Current Price</h3>
        <div class="price-display">${{ currentPrice }}/night</div>
      </div>
      
      <div class="suggested-price">
        <h3>AI Recommended Price</h3>
        <div class="price-range">
          <div class="min">${{ tips.suggestedPrice.min }}</div>
          <div class="optimal">${{ tips.suggestedPrice.optimal }}</div>
          <div class="max">${{ tips.suggestedPrice.max }}</div>
        </div>
        <div class="confidence">
          Confidence: {{ (tips.suggestedPrice.confidence * 100).toFixed(0) }}%
        </div>
      </div>
      
      <button @click="applyPrice" class="apply-btn">
        Apply Suggested Price
      </button>
      
      <div class="factors">
        <h4>Price Factors</h4>
        <div class="factor-list">
          <div class="factor-item">
            <span class="name">Seasonality</span>
            <span class="value" :class="{ positive: tips.factors.seasonality > 0, negative: tips.factors.seasonality < 0 }">
              {{ tips.factors.seasonality > 0 ? '+' : '' }}{{ (tips.factors.seasonality * 100).toFixed(0) }}%
            </span>
          </div>
          <div class="factor-item">
            <span class="name">Demand</span>
            <span class="value" :class="{ positive: tips.factors.demand > 0, negative: tips.factors.demand < 0 }">
              {{ tips.factors.demand > 0 ? '+' : '' }}{{ (tips.factors.demand * 100).toFixed(0) }}%
            </span>
          </div>
          <div class="factor-item">
            <span class="name">Competitor Prices</span>
            <span class="value" :class="{ positive: tips.factors.competitorPrices > 0, negative: tips.factors.competitorPrices < 0 }">
              {{ tips.factors.competitorPrices > 0 ? '+' : '' }}{{ (tips.factors.competitorPrices * 100).toFixed(0) }}%
            </span>
          </div>
          <div class="factor-item">
            <span class="name">Property Rating</span>
            <span class="value" :class="{ positive: tips.factors.propertyRating > 0, negative: tips.factors.propertyRating < 0 }">
              {{ tips.factors.propertyRating > 0 ? '+' : '' }}{{ (tips.factors.propertyRating * 100).toFixed(0) }}%
            </span>
          </div>
        </div>
      </div>
      
      <div class="similar-properties">
        <h4>Similar Properties</h4>
        <div class="property-list">
          <div v-for="prop in tips.similarProperties" :key="prop.id" class="similar-property">
            <span class="name">{{ prop.name }}</span>
            <span class="price">${{ prop.basePrice }}/night</span>
            <span class="rating">⭐ {{ prop.rating.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ propertyId: string; currentPrice: number }>()
const { data: tips, pending: loading } = await useFetch<any>(`/api/properties/${props.propertyId}/pricing-tips`)

const applyPrice = async () => {
  await $fetch(`/api/properties/${props.propertyId}`, {
    method: 'PATCH',
    body: { basePrice: tips.value.suggestedPrice.optimal }
  })
}
</script>

<style scoped>
.pricing-tips {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.tips-content {
  display: grid;
  gap: 24px;
}

.current-price, .suggested-price {
  padding: 16px;
  border-radius: 8px;
  background: #f9fafb;
}

.current-price h3, .suggested-price h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6b7280;
}

.price-display {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.min, .max {
  font-size: 18px;
  color: #6b7280;
}

.optimal {
  font-size: 32px;
  font-weight: 700;
  color: #6366f1;
}

.confidence {
  font-size: 14px;
  color: #6b7280;
}

.apply-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.apply-btn:hover {
  transform: translateY(-2px);
}

.factors h4, .similar-properties h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #374151;
}

.factor-list, .property-list {
  display: grid;
  gap: 12px;
}

.factor-item, .similar-property {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.value.positive {
  color: #059669;
}

.value.negative {
  color: #dc2626;
}

.similar-property {
  gap: 16px;
}

.similar-property .name {
  flex: 1;
  font-weight: 500;
}

.similar-property .price {
  font-weight: 600;
  color: #374151;
}

.similar-property .rating {
  color: #f59e0b;
}
</style>
