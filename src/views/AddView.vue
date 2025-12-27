<template>
  <div class="page-wrapper">
    <!-- タブ切り替え -->
    <div class="tab-switcher">
      <button
        :class="{ active: currentTab == 'cook' }"
        @click="switchTab('cook')"
      >
        Cook
      </button>
      <button
        :class="{ active: currentTab == 'eat' }"
        @click="switchTab('eat')"
      >
        Eat
      </button>
    </div>

    <!-- 日付入力 -->
    <label for="date">
      Date:
      <input id="date" type="date" v-model="form.date" />
    </label>

    <!-- タイトル入力 -->
    <label for="title">
      Title:
      <input
        id="title"
        type="text"
        placeholder="メニュー名など"
        v-model="form.title"
      />
    </label>

    <!-- カテゴリー選択 -->
    <fieldset class="radio-group">
      <legend>Category:</legend>
      <div v-for="cat in currentCategories" :key="cat.name" class="radio-item">
        <input
          type="radio"
          :id="'category-' + cat.name"
          name="category"
          v-model="form.category"
          :value="cat.name"
        />
        <label :for="'category-' + cat.name">{{ cat.name }}</label>
      </div>
    </fieldset>

    <!-- 写真アップロード -->
    <label for="photo" class="photo-upload">
      Photo:
      <span class="upload-btn"> 写真を選択してください </span>
      <input
        id="photo"
        type="file"
        ref="fileInput"
        multiple
        accept="image/*"
        @change="onFileChange"
      />
    </label>

    <!-- アップロードした画像のプレビュー -->
    <div class="image-preview" v-if="form.images.length">
      <div v-for="(img, i) in form.images" :key="i" class="preview-item">
        <img :src="img" @click="openPreview(img)" />
        <button class="remove-btn" @click="removeImage(i)">×</button>
      </div>
    </div>

    <!-- 画像プレビュー用モーダル -->
    <div v-if="previewImage" class="modal" @click="previewImage = null">
      <img :src="previewImage" class="modal-img" />
    </div>

    <!-- コメント入力 -->
    <label for="comment">Comment:</label>
    <textarea
      id="comment"
      placeholder="メモや感想など"
      v-model="form.comment"
    ></textarea>

    <!-- 投稿（保存）ボタン -->
    <button class="submit-btn" @click="submitPost">保存</button>

    <!-- メッセージ用モーダル -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <p>{{ modalMessage }}</p>
        <button @click="closeModal">閉じる</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { currentTab } from "../data/tabStore.js";
import { usePostsStore } from "../stores/postsStore.js";

const postsStore = usePostsStore();
const router = useRouter();
const route = useRoute();

// モーダル
const showModal = ref(false);
const modalMessage = ref("");

// フォーム
const form = reactive({
  id: null,
  date: new Date().toISOString().slice(0, 10),
  title: "",
  category: "",
  images: [],
  comment: "",
  isEditing: false,
  tab: null,
});

const fileInput = ref(null);
const previewImage = ref(null);

// タブ切替
const switchTab = (tab) => {
  currentTab.value = tab;
  form.tab = tab;
  router.replace({ query: { ...route.query, tab } });
};

// query.tab 監視（編集時の初期化では上書きしない）
let ignoreInitialTabWatch = true;
watch(
  () => route.query.tab,
  (newTab) => {
    if (ignoreInitialTabWatch) {
      ignoreInitialTabWatch = false;
      return;
    }
    if (newTab === "cook" || newTab === "eat") {
      currentTab.value = newTab;
      form.tab = newTab;
    }
  }
);

// カテゴリー
const currentCategories = computed(() =>
  currentTab.value === "cook"
    ? postsStore.cookCategories
    : postsStore.eatCategories
);

// 画像ファイル選択時の処理
const onFileChange = (event) => {
  const files = event.target.files;
  if (!files.length) return;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.images.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

// 画像削除ボタンを押したときの処理
const removeImage = (index) => {
  form.images.splice(index, 1);
};

// 編集モード初期化
onMounted(() => {
  if (postsStore.editingPost) {
    const post = postsStore.editingPost;
    form.id = post.id;
    form.date = post.date;
    form.title = post.title;
    form.category = post.category;
    form.images = [...post.images];
    form.comment = post.comment;
    form.isEditing = true;

    currentTab.value = post.tab;
    form.tab = post.tab;

    router.replace({ query: { ...route.query, tab: post.tab } });
  }
});

// 編集状態フラグ
const wasEditing = ref(false);
let closeTimer = null;
let lastEditedId = null;

// 投稿保存
const submitPost = async () => {
  if (!form.date || !form.title || !form.category || !form.images.length) {
    modalMessage.value =
      "日付・タイトル・カテゴリー・写真をすべて入力してください。";
    showModal.value = true;
    setTimeout(() => (showModal.value = false), 3000);
    return;
  }

  const postData = {
    id: form.isEditing ? Number(form.id) : Date.now(),
    date: form.date,
    title: form.title,
    category: form.category,
    images: [...form.images],
    comment: form.comment,
    tab: form.tab ?? currentTab.value, // 🔹 保存時は form.tab を優先
    isFavorite: form.isEditing
      ? postsStore.editingPost.isFavorite || false
      : false,
  };

  if (form.isEditing) {
    await postsStore.updatePost(postData);
    lastEditedId = postData.id;
    postsStore.clearEditingPost();
    modalMessage.value = "編集内容を保存しました！";
    wasEditing.value = true;
  } else {
    await postsStore.addPost(postData);
    modalMessage.value = "保存しました！";
    wasEditing.value = false;
  }

  showModal.value = true;

  // 自動で閉じる＆編集時は元ページへ戻る
  closeTimer = setTimeout(() => {
    showModal.value = false;
    goBackAfterEdit();
  }, 2000);

  // フォームリセット
  form.id = null;
  form.date = new Date().toISOString().slice(0, 10);
  form.title = "";
  form.category = "";
  form.images = [];
  form.comment = "";
  form.isEditing = false;
  form.tab = null;
};

const goBackAfterEdit = () => {
  if (!wasEditing.value || !lastEditedId) return;

  const from = route.query.from ?? "home";
  const tab = form.tab ?? currentTab.value;
  const category = route.query.category ?? "";
  const keyword = route.query.keyword || "";

  router.push({
    name: "PostDetail",
    params: { id: String(lastEditedId) },
    query: {
      from,
      tab,
      ...(category ? { category } : {}),
      ...(keyword ? { keyword } : {}),
    },
  });
};

// モーダルを閉じたとき
const closeModal = () => {
  showModal.value = false;
  if (closeTimer) clearTimeout(closeTimer);
  goBackAfterEdit();
};
</script>

<style scoped>
.page-wrapper {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* タブ切り替えボタン */
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

/* 入力フォーム */
label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
}

input[type="text"],
input[type="date"],
textarea {
  margin-top: 4px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

/* fieldset全体 */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px;
  border: none;
  padding: 0;
  gap: 8px;
}

/* ラジオアイテム */
.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  flex: 1 1 0;
  justify-content: center;
  min-width: 100px;
  margin-bottom: 8px;
}

/* legend のスタイル */
.radio-group legend {
  font-weight: bold;
  font-size: 15px;
  color: #333;
  margin-bottom: 6px;
}

/* ラジオボタン自体 */
.radio-item input[type="radio"] {
  accent-color: var(--theme-color);
  width: 18px;
  height: 18px;
}

@media (max-width: 700px) {
  .radio-group {
    justify-content: flex-start;
    gap: 8px;
  }

  .radio-item {
    flex: 0 0 31%;
    box-sizing: border-box;
    margin-bottom: 8px;
  }
}

/* ファイル選択ボタン */
.photo-upload input[type="file"] {
  display: none;
}

.upload-btn {
  display: inline-block;
  background-color: var(--theme-color);
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  text-align: center;
  transition: 0.2s;
}

.upload-btn:hover {
  opacity: 0.8;
}

/* 画像プレビュー */
.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.preview-item {
  position: relative;
}

.preview-item img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
}

/* 削除ボタン */
.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  line-height: 18px;
  cursor: pointer;
  transition: 0.2s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* 画像プレビュー用モーダル */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
}

/* 保存ボタン */
.submit-btn {
  background-color: var(--theme-color);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.2s;
}
.submit-btn:hover {
  opacity: 0.8;
}

/* メッセージ用モーダル */
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
