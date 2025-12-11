<template>
  <div class="page-wrapper">
    <!-- タブ切り替え -->
    <div class="tab-switcher">
      <button
        :class="{ active: currentTab === 'cook' }"
        @click="switchTab('cook')"
      >
        Cook
      </button>
      <button
        :class="{ active: currentTab === 'eat' }"
        @click="switchTab('eat')"
      >
        Eat
      </button>
    </div>

    <!-- カテゴリボタン -->
    <CategoryButtons :categories="currentCategories" :tab="currentTab" />

    <!-- タイトル -->
    <h2 class="section-title">{{ currentTitle }}</h2>

    <!-- 投稿一覧 -->
    <SavedPosts :posts="currentPosts" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePostsStore } from "../stores/postsStore.js";

import CategoryButtons from "../components/CategoryButtons.vue";
import SavedPosts from "../components/SavedPosts.vue";

const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();

// 現在のタブをURLクエリから取得
const currentTab = ref(route.query.tab === "eat" ? "eat" : "cook");

// URLクエリが変わったら反映
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === "cook" || newTab === "eat") {
      currentTab.value = newTab;
    }
  },
  { immediate: true }
);

// タブ切り替え（URLクエリも更新）
const switchTab = (tab) => {
  if (tab !== currentTab.value) {
    currentTab.value = tab;
    router.replace({
      query: { ...route.query, tab }, // ← 他のクエリを保持しつつ更新
    });
  }
};

// カテゴリ配列
const currentCategories = computed(() =>
  currentTab.value === "cook"
    ? postsStore.cookCategories
    : postsStore.eatCategories
);

// タイトル
const currentTitle = computed(() =>
  currentTab.value === "cook" ? "Cooking Diary" : "Eating Diary"
);

// 投稿一覧
const currentPosts = computed(() =>
  currentTab.value === "cook" ? postsStore.cookPosts : postsStore.eatPosts
);

// マウント時にデフォルトtab設定
onMounted(async () => {
  await postsStore.loadPostsFromDB();
  if (!route.query.tab) {
    router.replace({ query: { ...route.query, tab: "cook" } });
  }
});
</script>

<style scoped>
.page-wrapper {
  padding: 0 16px;
}

.tab-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.tab-switcher button {
  width: 70px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  text-align: center;
  margin: 0 4px;
  background-color: #eee;
  color: #333;
}

.tab-switcher button.active {
  background-color: var(--theme-color);
  color: white;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 16px 0;
  border-top: 2px solid #eee;
  padding-top: 10px;
  color: #333;
}
</style>
