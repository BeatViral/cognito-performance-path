import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  root: "app",
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "docs"),
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
});
