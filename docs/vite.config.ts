import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The docs import the library straight from ../src so every change is live.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "t-charts": r("../src/index.ts"),
      // make ../src resolve the docs' React, not the root devDependency
      react: r("./node_modules/react"),
      "react-dom": r("./node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: { port: 5302, strictPort: true, fs: { allow: [".."] } },
});
