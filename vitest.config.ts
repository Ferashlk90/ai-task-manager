import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for the pure / security-sensitive helpers. `server-only` is aliased
// to an empty module (those modules import it as a build guard), and a dummy
// SESSION_SECRET is provided since jwt.ts requires it at import time.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      SESSION_SECRET: "test-only-secret-not-used-anywhere-real",
    },
  },
  resolve: {
    alias: {
      "server-only": fileURLToPath(new URL("./src/test/empty.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
