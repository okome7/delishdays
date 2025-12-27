import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  base: isProduction ? "/delishdays/" : "/",
  plugins: [vue(), svgLoader()],
});
