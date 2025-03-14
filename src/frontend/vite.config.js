import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  
  // Define global variables
  define: {
    // Ensure React is available globally
    'window.React': 'React',
    // Make process.env available
    'process.env': process.env
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['react-calendar', 'react-toastify']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'luxon', 'axios', 'react-calendar', 'react-toastify']
  },
  
  resolve: {
    alias: {
      './contexts/BookingContext.jsx': './contexts/BookingContext.jsx'
    }
  }
})
