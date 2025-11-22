import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { getSettings, saveSettingsToDB } from "../utils/settingsDB";
import { usePostsStore } from "./postsStore";

export const useSettingsStore = defineStore("settings", () => {
  const notificationsEnabled = ref(true);
  const themeColor = ref("pink");
  const userName = ref("ゲスト");
  const isLoaded = ref(false);
  const isResetting = ref(false);

  const postsStore = usePostsStore();

  const themeMap = {
    pink: { main: "#f5d7d0", bg: "#fbe9e6" },
    beige: { main: "#F5DEB3", bg: "#FFF3DD" },
    mono: { main: "#D1D5DB", bg: "#E5E7EB" },
    blue: { main: "#7DD3FC", bg: "#E0F2FE" },
    green: { main: "#86EFAC", bg: "#DCFCE7" },
    purple: { main: "#C4B5FD", bg: "#F5F3FF" },
  };

  const applyTheme = (color) => {
    const selected = themeMap[color] || themeMap.pink;
    document.documentElement.style.setProperty("--theme-color", selected.main);
    document.documentElement.style.setProperty("--theme-bg", selected.bg);
  };

  const loadSettings = async () => {
    const data = await getSettings();
    if (data) {
      notificationsEnabled.value = data.notificationsEnabled ?? true;
      themeColor.value = data.themeColor ?? "pink";
      userName.value = data.userName ?? "ゲスト";
    }
    applyTheme(themeColor.value);
    isLoaded.value = true;
  };

  const saveSettings = async () => {
    await saveSettingsToDB({
      notificationsEnabled: notificationsEnabled.value,
      themeColor: themeColor.value,
      userName: userName.value,
    });
  };

  watch(notificationsEnabled, saveSettings);
  watch(themeColor, (color) => {
    applyTheme(color);
    saveSettings();
  });
  watch(userName, saveSettings);

  const toggleNotifications = () => {
    notificationsEnabled.value = !notificationsEnabled.value;
  };
  const changeTheme = (color) => (themeColor.value = color);
  const updateUserName = (name) => (userName.value = name);
  const logout = () => (userName.value = "ゲスト");

  const resetAll = async () => {
    try {
      isResetting.value = true;
      await postsStore.clearAll();
      notificationsEnabled.value = true;
      themeColor.value = "pink";
      userName.value = "ゲスト";
      applyTheme(themeColor.value);
      await saveSettings();
      console.log("アプリ全リセット完了");
    } finally {
      isResetting.value = false;
    }
  };

  return {
    notificationsEnabled,
    themeColor,
    userName,
    isLoaded,
    isResetting,
    loadSettings,
    toggleNotifications,
    changeTheme,
    updateUserName,
    logout,
    resetAll,
    applyTheme,
  };
});
