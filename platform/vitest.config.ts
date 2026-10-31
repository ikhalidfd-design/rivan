import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  css: {
    // لا معالجة CSS في اختبارات الوحدة (تجاوز postcss.config.tailwind)
    postcss: { plugins: [] },
  },
  resolve: {
    alias: {
      // المكتبات المحمية بـ server-only تُختبر عبر وحدة فارغة
      "server-only": path.resolve(__dirname, "tests/__mocks__/server-only.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
