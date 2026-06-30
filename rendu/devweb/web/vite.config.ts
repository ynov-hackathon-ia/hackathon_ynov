import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_OLLAMA_BASE_URL ?? 'http://10.15.0.62:11434',
        changeOrigin: true,
      },
    },
  },
})
