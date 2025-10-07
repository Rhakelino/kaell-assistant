import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Semua request dari frontend ke /chat akan diteruskan ke backend
      // Ini hanya berlaku saat development (npm run dev)
      '/chat': 'http://localhost:9000', 
    }
  }
})
