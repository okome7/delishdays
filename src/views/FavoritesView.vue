<template>
  <div class="favorites">
    <div v-if="favorites.length === 0" class="empty">
      まだお気に入りはありません。
    </div>

    <div class="saved-posts">
      <div
        v-for="post in favorites"
        :key="post.id"
        class="saved-post"
        @click="openDetail(post)"
      >
        <img :src="post.images[0]" :alt="post.title" />
        <p>{{ post.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePostsStore } from "../stores/postsStore.js";

const router = useRouter();
const route = useRoute();
const postsStore = usePostsStore();

const favorites = computed(() => postsStore.favoritePosts);

// 詳細ページへ遷移
const openDetail = (post) => {
  router.push({
    name: "PostDetail",
    params: { id: post.id },
    query: { from: "favorites", tab: route.query.tab || "cook" },
  });
};
</script>

<style scoped>
.favorites {
  padding: 10px 16px;
}

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
}

.saved-post:hover {
  transform: translateY(-4px);
}

.saved-post img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.saved-post p {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  padding: 8px 12px;
}

.empty {
  color: gray;
  text-align: center;
  margin-top: 40px;
}
</style>
