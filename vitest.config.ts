import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const radix = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": radix,
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
})
