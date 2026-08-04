<template>
  <div class="review-summary">
    <div v-if="loading" class="loading">Loading summary...</div>
    
    <div v-else-if="summary" class="summary-content">
      <div class="overall-rating">
        <h3>{{ summary.overall }}</h3>
        <div class="review-count">Based on {{ summary.reviewCount }} reviews</div>
      </div>
      
      <div class="categories">
        <h4>Category Ratings</h4>
        <div class="category-grid">
          <div class="category-item">
            <span class="label">Cleanliness</span>
            <div class="rating-bar">
              <div class="fill" :style="{ width: (summary.categories.cleanliness / 5 * 100) + '%' }"></div>
            </div>
            <span class="score">{{ summary.categories.cleanliness.toFixed(1) }}/5</span>
          </div>
          <div class="category-item">
            <span class="label">Location</span>
            <div class="rating-bar">
              <div class="fill" :style="{ width: (summary.categories.location / 5 * 100) + '%' }"></div>
            </div>
            <span class="score">{{ summary.categories.location.toFixed(1) }}/5</span>
          </div>
          <div class="category-item">
            <span class="label">Communication</span>
            <div class="rating-bar">
              <div class="fill" :style="{ width: (summary.categories.communication / 5 * 100) + '%' }"></div>
            </div>
            <span class="score">{{ summary.categories.communication.toFixed(1) }}/5</span>
          </div>
          <div class="category-item">
            <span class="label">Value</span>
            <div class="rating-bar">
              <div class="fill" :style="{ width: (summary.categories.value / 5 * 100) + '%' }"></div>
            </div>
            <span class="score">{{ summary.categories.value.toFixed(1) }}/5</span>
          </div>
        </div>
      </div>
      
      <div class="pros-cons">
        <div class="pros">
          <h4>✓ Pros</h4>
          <ul>
            <li v-for="pro in summary.pros" :key="pro">{{ pro }}</li>
          </ul>
        </div>
        <div class="cons">
          <h4>✗ Cons</h4>
          <ul>
            <li v-for="con in summary.cons" :key="con">{{ con }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ propertyId: string }>()
const { data: summary, pending: loading } = await useFetch(`/api/properties/${props.propertyId}/review-summary`)
</script>

<style scoped>
.review-summary {
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

.overall-rating {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.overall-rating h3 {
  font-size: 24px;
  color: #111827;
  margin: 0 0 8px 0;
}

.review-count {
  color: #6b7280;
  font-size: 14px;
}

.categories {
  margin-bottom: 24px;
}

.categories h4 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #374151;
}

.category-grid {
  display: grid;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  width: 100px;
  font-size: 14px;
  color: #374151;
}

.rating-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.3s;
}

.score {
  width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.pros h4 {
  color: #059669;
  margin: 0 0 12px 0;
}

.cons h4 {
  color: #dc2626;
  margin: 0 0 12px 0;
}

.pros ul, .cons ul {
  margin: 0;
  padding-left: 20px;
}

.pros li, .cons li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}
</style>
