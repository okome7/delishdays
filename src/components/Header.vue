<template>
  <header class="header">
    <!-- 左エリア: 戻るボタン -->
    <div class="left-area" v-if="showBackButton" @click="goBack">
      <BackIcon class="back-icon" />
    </div>

    <!-- 中央エリア: タイトル or 検索バー -->
    <div class="center-area">
      <h1 v-if="!isSearching" class="title">{{ pageTitle }}</h1>

      <div v-else class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="検索ワードを入力"
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">検索</button>
        <button class="back-btn" @click="toggleSearch">戻る</button>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <p>{{ modalMessage }}</p>
        <button @click="closeModal">閉じる</button>
      </div>
    </div>

    <!-- 右エリア: 検索アイコン -->
    <div class="right-area" v-if="route.name !== 'add'">
      <SearchIcon class="search-icon" @click="toggleSearch" />
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import SearchIcon from "../assets/icons/search.svg?component";
import BackIcon from "../assets/icons/back.svg?component";
import { usePostsStore } from "../stores/postsStore.js";

const router = useRouter();
const route = useRoute();
const postsStore = usePostsStore();

const showModal = ref(false);
const modalMessage = ref("");

const closeModal = () => {
  showModal.value = false;
};

const isSearching = ref(false);
const searchQuery = ref("");

// 検索バー切り替え
const toggleSearch = () => {
  isSearching.value = !isSearching.value;
  searchQuery.value = "";
};

// 検索処理
const handleSearch = () => {
  const keyword = searchQuery.value;
  const results = postsStore.performSearch(keyword);

  if (results.length === 0) {
    modalMessage.value = "該当する投稿はありません";
    showModal.value = true;
  } else if (results.length === 1) {
    router.push({
      name: "PostDetail",
      params: { id: results[0].id },
      query: {
        from: "SearchResults",
        keyword,
      },
    });
  } else {
    router.push({
      name: "SearchResults",
      query: { keyword },
    });
  }

  searchQuery.value = "";
  isSearching.value = false;
};

// ページタイトル
const pageTitle = computed(() => {
  switch (route.name) {
    case "home":
      return "Home";
    case "calendar":
      return "Calendar";
    case "add":
      return postsStore.editingPost ? "Edit" : "Add";
    case "favorites":
      return "Favorites";
    case "settings":
      return "Settings";
    case "category":
      return route.params.category || "Category";
    case "PostDetail":
      return "Meal Details";
    default:
      return "Delish Days";
  }
});

// 戻るボタンの表示条件
const showBackButton = computed(() => {
  if (route.name === "category" || route.name === "PostDetail") return true;
  if (route.name === "add" && postsStore.editingPost) return true;
  if (route.name === "SearchResults") return true;
  return false;
});

// 戻る処理
const goBack = () => {
  const category = route.query.category;
  const tab = route.query.tab || "cook";
  const keyword = route.query.keyword || "";
  const from = route.query.from;

  // 編集画面（add）で editingPost があるとき → 詳細ページに戻る
  if (route.name === "add" && postsStore.editingPost) {
    const postId = postsStore.editingPost.id;

    router.push({
      name: "PostDetail",
      params: { id: postId },
      query: {
        from: from ?? "home",
        tab,
        category,
        keyword,
      },
    });
    return;
  }

  // 詳細ページから戻る場合だけ category があればカテゴリページに戻す
  if (route.name === "PostDetail" && category) {
    router.push({
      name: "category",
      query: { tab, category },
    });
    return;
  }

  // 検索結果から来た場合
  if (from === "SearchResults") {
    const results = postsStore.performSearch(keyword);
    if (results.length === 1) {
      router.push({ name: "home", query: { tab } });
    } else {
      router.push({ name: "SearchResults", query: { keyword } });
    }
    return;
  }

  // お気に入りページ
  if (from === "favorites") {
    router.push({ name: "favorites" });
    return;
  }

  // カレンダー
  if (from === "calendar") {
    router.push({ name: "calendar" });
    return;
  }

  // 保存済みから来た場合
  if (from === "saved") {
    router.push({ name: "home", query: { tab } });
    return;
  }

  // デフォルト → ホームに戻る
  router.push({ name: "home", query: { tab } });
};
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  color: #333;
  height: 60px;
  padding: 0 10px;
  z-index: 1000;
}

.left-area,
.right-area {
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* アイコン */
.back-icon,
.search-icon {
  width: 24px;
  height: 24px;
  color: var(--theme-color);
  cursor: pointer;
}

/* タイトル */
.title {
  font-size: 1.5rem;
  font-weight: bold;
}

/* 検索ボックス */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 600px;
}

/* 入力欄 */
.search-input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #999;
  box-shadow: 0 0 5px rgba(153, 153, 153, 0.3);
}

.search-input::placeholder {
  color: #aaa;
}

/* ボタン */
.search-btn,
.back-btn {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #333;
}

.back-icon {
  margin-right: 8px;
}

.search-icon {
  margin-left: 8px;
}

.search-btn:hover,
.back-btn:hover {
  background-color: #e0e0e0;
}

@media screen and (max-width: 480px) {
  .search-box {
    gap: 0.3rem;
  }

  .search-input {
    font-size: 0.9rem;
    padding: 0.4rem 0.6rem;
  }

  .search-btn,
  .back-btn {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
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

.modal-content p {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 1.2rem;
}

.modal-content button {
  background-color: var(--theme-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 8px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.modal-content button:hover {
  opacity: 0.8;
}
</style>
