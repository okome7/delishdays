<template>
  <footer class="footer-nav">
    <router-link to="/" :class="{ active: isActive('home') }">
      <HomeIcon class="icon" />
    </router-link>

    <router-link to="/calendar" :class="{ active: isActive('calendar') }">
      <CarendarIcon class="icon" />
    </router-link>

    <router-link
      to="/add"
      :class="{ active: isActive('add') }"
      @click="handleAddClick"
    >
      <AddIcon class="icon-add" />
    </router-link>

    <router-link to="/favorites" :class="{ active: isActive('favorites') }">
      <FavoritesIcon class="icon" />
    </router-link>

    <router-link to="/settings" :class="{ active: isActive('settings') }">
      <SettingIcon class="icon" />
    </router-link>
  </footer>
</template>

<script setup>
import { useRoute } from "vue-router";
import { usePostsStore } from "../stores/postsStore.js";
import HomeIcon from "../assets/icons/home.svg?component";
import CarendarIcon from "../assets/icons/calendar.svg?component";
import AddIcon from "../assets/icons/add.svg?component";
import FavoritesIcon from "../assets/icons/favorites.svg?component";
import SettingIcon from "../assets/icons/setting.svg?component";

const route = useRoute();
const postsStore = usePostsStore();

// 現在のページがアクティブか
const isActive = (name) => route.name === name;

// 追加ボタンを押したときは編集情報をクリア
const handleAddClick = () => {
  postsStore.clearEditingPost();
};
</script>

<style scoped>
.footer-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
}

.icon {
  width: 28px;
  height: 28px;
  color: #333;
  padding-top: 2px;
}

.active .icon {
  color: var(--theme-color);
}

.icon-add {
  width: 40px;
  height: 40px;
  padding-top: 3px;
  color: var(--theme-color);
}
</style>
