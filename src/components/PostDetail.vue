<template>
  <div class="detail-page">
    <!-- 画像と詳細情報のまとまり -->
    <div class="content-section">
      <div class="images-section">
        <button
          v-if="post?.images?.length > 1"
          class="arrow-btn left"
          @click="prevImage"
        >
          &lt;
        </button>

        <img
          :src="post?.images[currentImage]"
          :alt="post?.title"
          class="main-image"
        />

        <button
          v-if="post?.images?.length > 1"
          class="arrow-btn right"
          @click="nextImage"
        >
          &gt;
        </button>
      </div>

      <div class="details-section">
        <h2 class="detail-title">{{ post?.title }}</h2>
        <p class="detail-date">Date: {{ post?.date }}</p>
        <p class="detail-category">Category: {{ post?.category }}</p>
        <p class="detail-comment">Comment: {{ post?.comment }}</p>
      </div>
    </div>

    <!-- 下に固定するアクションボタン -->
    <div class="action-buttons">
      <button class="heart-btn" @click="toggleFavorite">
        <span v-if="isFavorite">
          <FavoritesRedIcon class="icon" :class="{ animate: iconAnimating }" />
        </span>
        <span v-else>
          <FavoritesBorderIcon
            class="icon"
            :class="{ animate: iconAnimating }"
          />
        </span>
      </button>

      <button class="edit-btn" @click="editPost(post)">編集</button>
      <button class="delete-btn" @click="openDeleteModal">削除</button>
    </div>

    <!-- 削除確認モーダル -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <p>本当に削除しますか？</p>
        <div class="modal-buttons">
          <button class="confirm-btn" @click="confirmDelete">はい</button>
          <button class="cancel-btn" @click="closeDeleteModal">いいえ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePostsStore } from "../stores/postsStore.js";
import FavoritesRedIcon from "../assets/icons/favorites-red.svg?component";
import FavoritesBorderIcon from "../assets/icons/favorites-border.svg?component";

const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();

// 投稿取得（computed のまま読み取り専用）
const post = computed(() => {
  const allPosts = [...postsStore.cookPosts, ...postsStore.eatPosts];
  return allPosts.find((p) => p.id == route.params.id);
});

// 画像スライダー
const currentImage = ref(0);
const prevImage = () => {
  if (!post.value?.images) return;
  currentImage.value =
    currentImage.value === 0
      ? post.value.images.length - 1
      : currentImage.value - 1;
};
const nextImage = () => {
  if (!post.value?.images) return;
  currentImage.value =
    currentImage.value === post.value.images.length - 1
      ? 0
      : currentImage.value + 1;
};

// お気に入り
const iconAnimating = ref(false);
const isFavorite = computed(() => post.value?.isFavorite || false);

const toggleFavorite = async () => {
  if (!post.value) return;

  // Pinia 側で更新
  await postsStore.toggleFavorite(post.value.id);

  // アニメーション
  iconAnimating.value = true;
  setTimeout(() => (iconAnimating.value = false), 300);
};

const from = ref(route.query.from ?? "home");
const tab = ref(route.query.tab ?? "cook");

// 編集ボタン
const editPost = () => {
  postsStore.setEditingPost(post.value);
  router.push({
    name: "add",
    query: {
      from: from.value,
      tab: tab.value,
      keyword: route.query.keyword || "",
      category: route.query.category || "",
    },
  });
};

const showDeleteModal = ref(false);
const openDeleteModal = () => (showDeleteModal.value = true);
const closeDeleteModal = () => (showDeleteModal.value = false);

const confirmDelete = async () => {
  if (!post.value) return;

  const tab = post.value.tab;
  const category = route.query.category || "";

  try {
    await postsStore.removePost(post.value);
    closeDeleteModal();

    // saved から来た場合
    if (from.value === "saved") {
      router.push({ name: "home", query: { tab } });
      return;
    }

    // SearchResults から来た場合
    if (from.value === "SearchResults") {
      const keyword = route.query.keyword || "";
      const results = postsStore.performSearch(keyword);

      if (results.length <= 1) {
        router.push({ name: "home", query: { tab } });
        return;
      }

      router.push({ name: "SearchResults", query: { keyword } });
      return;
    }

    // category がある場合 → カテゴリページに戻る
    if (category) {
      router.push({ name: "category", query: { tab, category } });
      return;
    }

    // favorites から来た場合
    if (from.value === "favorites") {
      router.push({ name: "favorites" });
      return;
    }

    // calendar から来た場合
    if (from.value === "calendar") {
      router.push({ name: "calendar" });
      return;
    }

    // fallback → ホーム
    router.push({ name: "home", query: { tab } });
  } catch (err) {
    console.error(err);
    closeDeleteModal();
    alert("削除に失敗しました。");
  }
};
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 20px;
  color: #333;
  box-sizing: border-box;
  position: relative;
}

.content-section {
  display: flex;
  gap: 100px;
  flex-wrap: wrap;
  justify-content: flex-start;
  max-width: 100%;
  box-sizing: border-box;
  padding-left: 20px;
}

.images-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-image {
  max-width: 500px;
  min-width: 200px;
  border-radius: 16px;
  border: 2px solid var(--theme-color);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  object-fit: contain;
}

.arrow-btn {
  background-color: var(--theme-color);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 1.8rem;
  cursor: pointer;
  color: white;
  font-weight: bold;
  transition: all 0.2s;
}

.arrow-btn:hover {
  background-color: #f5a88c;
}

.details-section {
  max-width: 40vw;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-title {
  font-size: 2rem;
  font-weight: bold;
}

.detail-date,
.detail-category {
  font-size: 1rem;
  color: #333;
}

.detail-comment {
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.action-buttons {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 10px 20px;
  background-color: #fff;
  border-radius: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--theme-color);
}

.heart-btn,
.edit-btn,
.delete-btn {
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  flex-shrink: 0;
  width: 80px;
  height: 50px;
  transition: transform 0.2s ease;
}

.heart-btn:active {
  transform: scale(0.9);
}

.icon {
  width: 25px;
  padding-top: 5px;
}

.heart-btn {
  background-color: var(--theme-color);
}

.edit-btn {
  background-color: #f5a88c;
  color: white;
}

.delete-btn {
  background-color: #f56262;
  color: white;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 24px 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.confirm-btn,
.cancel-btn {
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  width: 100px;
}

.confirm-btn {
  background-color: #f56262;
  color: white;
}

.cancel-btn {
  background-color: #ccc;
  color: #333;
}

/* レスポンシブ */
@media (max-width: 1024px) {
  .details-section {
    max-width: 45vw;
  }
  .content-section {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .detail-page {
    padding-bottom: 100px;
  }
  .content-section {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding-left: 0;
  }
  .main-image {
    width: 60vw;
  }
  .details-section {
    max-width: 90vw;
  }
  .action-buttons {
    padding: 10px 30px;
  }
}

@media (max-width: 480px) {
  .main-image {
    width: 60vw;
  }
  .details-section {
    max-width: 90vw;
  }
  .detail-title {
    font-size: 1.6rem;
  }
  .detail-comment {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .main-image {
    height: 70vh;
    width: auto;
    max-width: 500px;
    min-width: 200px;
  }
}
</style>
