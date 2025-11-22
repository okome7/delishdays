import { createApp } from "vue";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import { usePostsStore } from "./stores/postsStore.js";
import "./assets/styles/main.css";

import HomeView from "./views/HomeView.vue";
import CalendarView from "./views/CalendarView.vue";
import AddView from "./views/AddView.vue";
import FavoritesView from "./views/FavoritesView.vue";
import SettingsView from "./views/SettingsView.vue";
import CategoryView from "./views/CategoryView.vue";
import PostDetail from "./components/PostDetail.vue";
import SavedPosts from "./components/SavedPosts.vue";
import SearchResult from "./components/SearchResults.vue";

// ルート設定
const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/calendar", name: "calendar", component: CalendarView },
  { path: "/add", name: "add", component: AddView },
  { path: "/favorites", name: "favorites", component: FavoritesView },
  { path: "/settings", name: "settings", component: SettingsView },
  { path: "/category", name: "category", component: CategoryView },
  {
    path: "/saved",
    name: "saved",
    component: SavedPosts,
    props: () => {
      const postsStore = usePostsStore();
      return { posts: [...postsStore.cookPosts, ...postsStore.eatPosts] };
    },
  },
  { path: "/post/:id", name: "PostDetail", component: PostDetail, props: true },
  { path: "/search", name: "SearchResults", component: SearchResult },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Piniaとアプリ作成
const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount("#app");
