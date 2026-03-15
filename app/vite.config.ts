import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@10x/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    alias: {
      "@10x/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
    },
  },
});
