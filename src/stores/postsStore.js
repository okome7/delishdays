import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getAllPosts,
  savePost,
  deletePost,
  clearPosts,
} from "../utils/indexedDB.js";

// デフォルト画像
const defaultMain = "/images/default_main.jpg";
const defaultSide = "/images/default_side.jpg";
const defaultBread = "/images/default_bread.jpg";
const defaultSweets = "/images/default_sweets.jpg";
const defaultDrinks = "/images/default_drinks.jpg";
const defaultOther = "/images/default_other.jpg";

export const usePostsStore = defineStore("posts", () => {
  const cookPosts = ref([]);
  const eatPosts = ref([]);
  const editingPost = ref(null);

  const performSearch = (keyword) => {
    if (!keyword) return [];

    const lowerKeyword = keyword.toLowerCase();
    const allPosts = [...cookPosts.value, ...eatPosts.value];

    return allPosts.filter((post) => {
      const inTitle = post.title?.toLowerCase().includes(lowerKeyword);
      const inComment = post.comment?.toLowerCase().includes(lowerKeyword);

      return inTitle || inComment;
    });
  };

  const defaultImages = {
    Main: defaultMain,
    Side: defaultSide,
    Bread: defaultBread,
    Sweets: defaultSweets,
    Drinks: defaultDrinks,
    Other: defaultOther,
  };

  const fixImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images.filter((img) => typeof img === "string" && img.length > 0);
  };

  const cookCategories = computed(() =>
    Object.keys(defaultImages).map((cat) => {
      const posts = cookPosts.value.filter((p) => p.category === cat);
      const last = posts[posts.length - 1];
      const img = last && fixImages(last.images)[0];
      return {
        name: cat,
        image: img || defaultImages[cat],
      };
    })
  );

  const eatCategories = computed(() =>
    Object.keys(defaultImages).map((cat) => {
      const posts = eatPosts.value.filter((p) => p.category === cat);
      const last = posts[posts.length - 1];
      const img = last && fixImages(last.images)[0];
      return {
        name: cat,
        image: img || defaultImages[cat],
      };
    })
  );

  // DB から読み込み
  const loadPostsFromDB = async () => {
    const allPosts = await getAllPosts();

    const normalized = allPosts.map((p) => ({
      ...p,
      images: fixImages(p.images),
      isFavorite: p.isFavorite || false,
    }));

    cookPosts.value = normalized.filter((p) => p.tab === "cook");
    eatPosts.value = normalized.filter((p) => p.tab === "eat");
  };

  // 投稿追加
  const addPost = async (post) => {
    const newPost = {
      ...post,
      id: post.id || Date.now(),
      images: fixImages(post.images),
      isFavorite: post.isFavorite || false,
    };

    if (newPost.tab === "cook") cookPosts.value.push(newPost);
    else eatPosts.value.push(newPost);

    await savePost(newPost);
  };

  // 投稿更新
  const updatePost = async (updatedPost) => {
    updatedPost = {
      ...updatedPost,
      images: fixImages(updatedPost.images),
    };

    cookPosts.value = cookPosts.value.filter((p) => p.id !== updatedPost.id);
    eatPosts.value = eatPosts.value.filter((p) => p.id !== updatedPost.id);

    if (updatedPost.tab === "cook") {
      cookPosts.value.push(updatedPost);
    } else {
      eatPosts.value.push(updatedPost);
    }

    await savePost(updatedPost);
  };

  // 投稿削除
  const removePost = async (post) => {
    if (post.tab === "cook")
      cookPosts.value = cookPosts.value.filter((p) => p.id !== post.id);
    else eatPosts.value = eatPosts.value.filter((p) => p.id !== post.id);

    await deletePost(post.id);
  };

  const clearAll = async () => {
    cookPosts.value = [];
    eatPosts.value = [];
    await clearPosts();
  };

  const setEditingPost = (post) => {
    editingPost.value = post ? { ...post } : null;
  };

  const clearEditingPost = () => {
    editingPost.value = null;
  };

  // お気に入り切り替え
  const toggleFavorite = async (postId) => {
    let targetList = cookPosts.value.find((p) => p.id === postId)
      ? cookPosts.value
      : eatPosts.value;

    const index = targetList.findIndex((p) => p.id === postId);
    if (index === -1) return;

    const updatedPost = {
      ...targetList[index],
      isFavorite: !targetList[index].isFavorite,
    };
    targetList[index] = updatedPost;

    await savePost(updatedPost);

    return updatedPost;
  };

  const favoritePosts = computed(() =>
    [...cookPosts.value, ...eatPosts.value].filter((p) => p.isFavorite)
  );

  return {
    cookPosts,
    eatPosts,
    cookCategories,
    eatCategories,
    loadPostsFromDB,
    addPost,
    updatePost,
    removePost,
    clearAll,
    editingPost,
    setEditingPost,
    clearEditingPost,
    toggleFavorite,
    favoritePosts,
    performSearch,
  };
});
