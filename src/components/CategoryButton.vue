<template>
  <div class="category-card" @click="goCategoryPage">
    <img :src="image" :alt="category" />
    <p>{{ category }}</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  category: String,
  image: String,
  tab: String,
});

const goCategoryPage = () => {
  router.push({
    name: "category",
    query: {
      tab: props.tab || "cook",
      category: props.category,
    },
  });
};
</script>

<style scoped>
.category-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}

.category-card:hover {
  transform: scale(1.05);
}
.category-card img {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #eee;
}

.category-card p {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #333;
}
</style>
