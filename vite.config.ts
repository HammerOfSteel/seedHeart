import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/@tweenjs')) return 'tween'
          if (id.includes('node_modules/zustand')) return 'zustand'
          return undefined
        },
      },
    },
  },
})
