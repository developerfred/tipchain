import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vercel from 'vite-plugin-vercel';

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), vercel()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['viem', 'wagmi', '@reown/appkit'],
          'graphql-vendor': ['urql', 'graphql'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    
  },
  server: {
    historyApiFallback: true
  }
})
