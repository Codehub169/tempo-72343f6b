import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000, // Serve frontend on port 9000
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: 'http://localhost:8000', // Assuming backend runs on 8000 as per common FastAPI setup
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // if backend doesn't expect /api prefix
      }
    }
  },
  build: {
    outDir: 'dist' // Ensure build output is in 'dist'
  }
})
