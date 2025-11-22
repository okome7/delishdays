<template>
  <Header class="header" />

  <main class="main-content">
    <!-- 投稿ロード完了まで待機 -->
    <div v-if="loaded">
      <router-view />
    </div>
    <div v-else class="loading">投稿を読み込み中…</div>
  </main>

  <!-- 編集時のみフッター非表示 -->
  <FooterNav v-if="loaded && !isEditingPage" class="footer" />
</template>

<script setup>
import Header from "./components/Header.vue";
import FooterNav from "./components/FooterNav.vue";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePostsStore } from "./stores/postsStore.js";
import { useSettingsStore } from "./stores/settingsStore.js";

const route = useRoute();
const postsStore = usePostsStore();
const settingsStore = useSettingsStore();

// 編集ページかどうか
const isEditingPage = computed(
  () => route.path === "/add" && !!postsStore.editingPost
);

// 投稿ロード完了フラグ
const loaded = ref(false);

onMounted(async () => {
  try {
    await settingsStore.loadSettings();
    await postsStore.loadPostsFromDB();
  } catch (error) {
    console.error("初期ロードエラー:", error);
  } finally {
    loaded.value = true;
  }
});
</script>

<style scoped>
.loading {
  text-align: center;
  margin-top: 50px;
  font-size: 1.2rem;
  color: #888;
}
</style>
