<template>
  <div class="category-grid">
    <CategoryButton
      v-for="cat in categories"
      :key="cat.name"
      :category="cat.name"
      :image="cat.image"
      :tab="tab"
    />
  </div>
</template>

<script setup>
import CategoryButton from "./CategoryButton.vue";

const props = defineProps({
  categories: Array,
  tab: String,
});
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
