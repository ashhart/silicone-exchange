import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "data/**/*.test.ts"],
    environment: "node",
  },
});
