<template>
  <div class="saved-posts">
    <div
      class="saved-post"
      v-for="post in sortedPosts"
      :key="post.id"
      @click="openDetail(post)"
    >
      <img :src="post.images[0]" :alt="post.title" />

      <div class="post-info">
        <p class="post-title">{{ post.title }}</p>
        <p class="post-date">{{ formatDate(post.date) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

const props = defineProps({
  posts: {
    type: Array,
    required: true,
  },
  from: {
    type: String,
    default: "saved",
  },
});

// 新しい順（降順）
const sortedPosts = computed(() => {
  return [...props.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 日付フォーマット
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

// 詳細ページへ遷移
const openDetail = (post) => {
  router.push({
    name: "PostDetail",
    params: { id: post.id },
    query: {
      from: props.from,
      tab: route.query.tab || "cook",
      keyword: route.query.keyword || "",
    },
  });
};
</script>

<style scoped>
.saved-posts {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .saved-posts {
    grid-template-columns: repeat(2, 1fr);
  }
}

.saved-post {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 10px;
}

.saved-post:hover {
  transform: translateY(-4px);
}

.saved-post img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.post-info {
  padding: 8px 12px;
}

.post-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.post-date {
  font-size: 0.8rem;
  color: #777;
}
</style>
