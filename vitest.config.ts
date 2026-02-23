import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/components": path.resolve(__dirname, "components"),
      "@/store": path.resolve(__dirname, "app/store"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setupTests.ts",
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "scripts/**",
        "reports/**",
        "**/*.d.ts",
      ],
    },
    include: [
      "**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", ".next"],
  },
});
