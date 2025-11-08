import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        'og-hero': './src/api/og/hero',
        'og-tip': './src/api/og/tip',
      },
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "web3-vendor": ["viem", "wagmi", "@reown/appkit"],
          "graphql-vendor": ["urql", "graphql"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  base: "./",
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
