<template>
  <div class="calendar-page">
    <!-- カレンダーヘッダー -->
    <div class="calendar-header">
      <button @click="prevMonth"><</button>
      <h2>{{ currentYear }}年 {{ currentMonth + 1 }}月</h2>
      <button @click="nextMonth">></button>
    </div>

    <!-- カレンダー -->
    <div class="calendar-grid">
      <!-- 曜日 -->
      <div v-for="(w, index) in weekdays" :key="index" class="calendar-weekday">
        {{ w }}
      </div>

      <!-- 空セル + 日付 -->
      <div
        v-for="day in daysInMonth"
        :key="day.date || 'empty-' + Math.random()"
        class="calendar-day"
        :class="{ hasPost: day.posts?.length > 0, empty: day.empty }"
        @click="!day.empty && selectDate(day.date)"
      >
        <span v-if="!day.empty">{{ day.day }}</span>
      </div>
    </div>

    <!-- 選択した日の投稿 -->
    <div v-if="selectedPosts.length" class="post-list">
      <h3>{{ selectedDate }} の投稿</h3>
      <div
        v-for="post in selectedPosts"
        :key="post.id"
        class="post-item"
        @click="openDetail(post)"
      >
        <img :src="post.images[0]" alt="post image" />
        <p>{{ post.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePostsStore } from "../stores/postsStore.js";
import { useRouter, useRoute } from "vue-router";

const postsStore = usePostsStore();
const router = useRouter();
const route = useRoute();
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth());
const selectedDate = ref(null);
const selectedPosts = ref([]);

const allPosts = computed(() => [
  ...postsStore.cookPosts,
  ...postsStore.eatPosts,
]);

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

// 日付セル（空セルも考慮）
const daysInMonth = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  const lastDay = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0
  ).getDate();

  // 空セル
  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true });
  }

  // 日付セル
  for (let i = 1; i <= lastDay; i++) {
    const dateStr = `${currentYear.value}-${String(
      currentMonth.value + 1
    ).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const posts = allPosts.value.filter((p) => p.date === dateStr);
    days.push({ day: i, date: dateStr, posts });
  }

  return days;
});

// 日付選択
const selectDate = (date) => {
  selectedDate.value = date;
  selectedPosts.value = allPosts.value.filter((p) => p.date === date);
};

// 月移動
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else currentMonth.value--;
  selectedDate.value = null;
  selectedPosts.value = [];
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else currentMonth.value++;
  selectedDate.value = null;
  selectedPosts.value = [];
};

// 詳細ページへ遷移
const openDetail = (post) => {
  router.push({
    name: "PostDetail",
    params: { id: post.id },
    query: { from: "calendar", tab: route.query.tab || "cook" },
  });
};
</script>

<style scoped>
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.calendar-header button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-top: 5px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-weekday {
  text-align: center;
  font-weight: bold;
  padding: 8px 0;
  border-bottom: 1px solid #ccc;
}

.calendar-day {
  border: 1px solid #ccc;
  text-align: center;
  padding: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.calendar-day.empty {
  cursor: default;
  background: transparent;
}

.calendar-day:hover {
  background-color: #f8f8f8;
}

.hasPost {
  background-color: var(--theme-bg);
  border: 1px solid var(--theme-color);
  border-radius: 4px;
}

.post-list {
  padding: 0 18px;
  margin-top: 1rem;
  border-top: 1px solid #ccc;
}

.post-list h3 {
  margin: 5px 0;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.post-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
