import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Import path

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    host: "0.0.0.0",
    hmr: {
      overlay: false, // Disable HMR overlay
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }], // Use path.resolve for the alias
  },
  build: {
    target: ['chrome92', 'edge92', 'firefox94', 'safari15'], // Update versions to support top-level await
    rollupOptions: {
      // external: ['dayjs'],
    },
  },
  
  esbuild: {
    target: 'esnext', // Use 'esnext' to leverage the latest JavaScript features
  },
  base: '/',
});
