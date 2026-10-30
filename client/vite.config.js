import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // برای اینکه بتونی از مرورگر گوشی ببینیش
    port: 5173
  }
})
