<template>
  <div class="search-results-page">
    <p>検索結果: "{{ keyword }}"</p>

    <SavedPosts
      v-if="filteredPosts.length"
      :posts="filteredPosts"
      from="SearchResults"
    />

    <p v-else>該当する投稿はありません</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { usePostsStore } from "../stores/postsStore.js";
import SavedPosts from "./SavedPosts.vue";

const route = useRoute();
const postsStore = usePostsStore();

const keyword = route.query.keyword || "";

const filteredPosts = computed(() => {
  if (!keyword) return [];

  const lowerKeyword = keyword.toLowerCase();
  const allPosts = [...postsStore.cookPosts, ...postsStore.eatPosts];

  return allPosts.filter((post) => {
    const inTitle = post.title?.toLowerCase().includes(lowerKeyword);
    const inComment = post.comment?.toLowerCase().includes(lowerKeyword);

    return inTitle || inComment;
  });
});
</script>

<style scoped>
.search-results-page {
  padding: 0 16px;
}

.search-results-page p {
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
