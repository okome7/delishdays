<template>
  <div class="page-wrapper">
    <!-- 投稿一覧グリッド -->
    <div class="posts-grid">
      <div
        v-for="post in filteredPosts"
        :key="post.id"
        class="post-card"
        @click="openDetail(post)"
      >
        <img :src="post.images[0]" :alt="post.title" />
        <p>{{ post.title }}</p>
      </div>
      <p v-if="filteredPosts.length === 0">投稿がまだありません。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePostsStore } from "../stores/postsStore.js";

const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();

const tab = route.query.tab || "cook";
const category = route.query.category || "";

// DB読み込み状態
const loaded = ref(false);

onMounted(async () => {
  await postsStore.loadPostsFromDB(); // DBから投稿を読み込む
  loaded.value = true;
});

// タブに応じた投稿配列
const posts = computed(() =>
  tab === "cook" ? postsStore.cookPosts : postsStore.eatPosts
);

// 選択カテゴリの投稿だけを表示・日付降順にソート
const filteredPosts = computed(() => {
  if (!loaded.value) return [];

  return posts.value
    .filter((p) => p.category === category)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 詳細ページに遷移
const openDetail = (post) => {
  router.push({
    name: "PostDetail",
    params: { id: post.id },
    query: {
      from: category,
      tab: route.query.tab || "cook",
      category: route.query.category || "",
    },
  });
};
</script>

<style scoped>
.page-wrapper {
  padding: 10px 16px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.post-card {
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

.post-card:hover {
  transform: translateY(-4px);
}

.post-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.post-card p {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  padding: 8px 12px;
}
</style>
