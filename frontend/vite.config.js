import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      events: path.resolve(__dirname, 'node_modules/events'),
      util: path.resolve(__dirname, 'node_modules/util'),
      process: 'process/browser',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['events', 'util', 'process', 'buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
})
