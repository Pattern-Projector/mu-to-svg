import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
    exclude: ["mupdf"],
  },
  build: {
    target: "esnext",
  },
});
