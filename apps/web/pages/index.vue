<template>
  <div class="travelhub-container">
    <h1>TravelHub Vacation Rentals & Experiences</h1>
    <p>Discover boutique stays, curated tours, and AI-powered personalized travel recommendations.</p>
    
    <div class="search-bar">
      <input type="text" placeholder="Where do you want to go?" />
      <button>Search Stays</button>
    </div>
  </div>
</template>

<script setup>
// TravelHub Nuxt 3 Homepage Component
</script>

<style scoped>
.travelhub-container {
  padding: 2rem;
  font-family: system-ui, sans-serif;
}
.search-bar {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
input {
  padding: 0.75rem 1rem;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
