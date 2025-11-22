<template>
  <div class="settings" v-if="settingsStore.isLoaded">
    <!-- ユーザー設定 -->
    <section class="card">
      <h2>ユーザー設定</h2>
      <label for="userName">ユーザー名</label>
      <input
        id="userName"
        type="text"
        v-model="settingsStore.userName"
        class="input"
        autocomplete="username"
      />
    </section>

    <!-- 通知設定 -->
    <section class="card">
      <h2>通知設定</h2>
      <label class="switch" for="notificationsEnabled">
        <input
          id="notificationsEnabled"
          type="checkbox"
          v-model="settingsStore.notificationsEnabled"
        />
        <span class="slider"></span>
      </label>
    </section>

    <!-- テーマカラー -->
    <section class="card">
      <h2>テーマカラー</h2>
      <select
        id="themeColor"
        v-model="settingsStore.themeColor"
        autocomplete="off"
      >
        <option value="pink">ピンク</option>
        <option value="beige">ベージュ</option>
        <option value="mono">モノトーン</option>
        <option value="blue">水色</option>
        <option value="green">緑</option>
        <option value="purple">紫</option>
      </select>
    </section>

    <!-- アプリ情報 -->
    <section class="card">
      <h2>アプリ情報</h2>
      <p>アプリ名: Delish Days</p>
      <p>バージョン: 1.0.0</p>
      <p>開発者: おこめ</p>
      <p>最終更新日: 2025-11-19</p>
      <p>概要: 自炊と外食を分けて、日々の食事を記録するアプリ</p>
    </section>

    <!-- アプリリセット -->
    <section class="card">
      <h2>アプリをリセット</h2>
      <button class="btn-delete" @click="showConfirmModal = true">
        アプリ初期化
      </button>
    </section>

    <!-- 確認モーダル -->
    <div
      v-if="showConfirmModal"
      class="modal-overlay"
      @click="showConfirmModal = false"
    >
      <div class="modal-content" @click.stop>
        <p>⚠すべての投稿が削除されます。本当に実行しますか？</p>
        <div
          style="
            margin-top: 1rem;
            display: flex;
            justify-content: center;
            gap: 10px;
          "
        >
          <button class="btn-delete" @click="confirmReset">はい</button>
          <button @click="showConfirmModal = false">キャンセル</button>
        </div>
      </div>
    </div>

    <!-- 完了モーダル -->
    <div
      v-if="showCompleteModal"
      class="modal-overlay"
      @click="showCompleteModal = false"
    >
      <div class="modal-content" @click.stop>
        <p>アプリを初期化しました</p>
        <button @click="showCompleteModal = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useSettingsStore } from "../stores/settingsStore";
import { usePostsStore } from "../stores/postsStore";

const settingsStore = useSettingsStore();
const postsStore = usePostsStore();

const showConfirmModal = ref(false);
const showCompleteModal = ref(false);

function loadCalendarPosts() {
  postsStore.loadPostsForCalendar();
}
function loadFavorites() {
  postsStore.loadFavoritePosts();
}

const themeMap = {
  pink: { main: "#f5d7d0", bg: "#fbe9e6" },
  beige: { main: "#F5DEB3", bg: "#FFF3DD" },
  mono: { main: "#D1D5DB", bg: "#E5E7EB" },
  blue: { main: "#7DD3FC", bg: "#E0F2FE" },
  green: { main: "#86EFAC", bg: "#DCFCE7" },
  purple: { main: "#C4B5FD", bg: "#F5F3FF" },
};

function applyTheme(color) {
  const selected = themeMap[color] || themeMap.pink;
  document.documentElement.style.setProperty("--theme-color", selected.main);
  document.documentElement.style.setProperty("--theme-bg", selected.bg);
}

onMounted(async () => {
  await settingsStore.loadSettings();
  applyTheme(settingsStore.themeColor);
});

watch(() => settingsStore.themeColor, applyTheme);
watch(
  () => settingsStore.isResetting,
  (val) => {
    if (!val) {
      loadCalendarPosts();
      loadFavorites();
    }
  }
);

async function confirmReset() {
  showConfirmModal.value = false;
  await settingsStore.resetAll();
  applyTheme(settingsStore.themeColor);
  showCompleteModal.value = true;
}
</script>

<style scoped>
.settings {
  max-width: 900px;
  margin: 5px auto;
  font-family: "Helvetica", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 12px;
  font-size: 1.3rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
}

.input {
  width: 100%;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

button {
  margin-top: 12px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
  color: #fff;
}

.btn-delete {
  background-color: #f56565;
}

.btn-delete:hover {
  opacity: 0.9;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 28px;
}

.slider::before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4ade80;
}

input:checked + .slider::before {
  transform: translateX(22px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 1px solid #eee;
}
.modal-content button {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn-delete {
  background-color: #f56565;
  color: white;
}
.modal-content button:not(.btn-delete) {
  background-color: #9ca3af;
  color: white;
}
</style>
