import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  
  // Set the root directory to src/frontend
  root: resolve(__dirname, 'src/frontend'),
  
  // Optimize build configuration
  build: {
    // Output directory relative to the root
    outDir: resolve(__dirname, 'src/frontend/dist'),
    
    // Enable source maps for production debugging if needed
    sourcemap: false,
    
    // Optimize chunk size
    chunkSizeWarningLimit: 800,
    
    // Configure Rollup options
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Group React and routing libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Group date/time libraries
          'vendor-date': ['luxon', 'react-calendar'],
          
          // Group API and data fetching libraries
          'vendor-api': ['axios'],
          
          // Group context providers
          'app-context': ['/src/frontend/contexts/BookingContext.jsx'],
        }
      }
    },
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        // Remove debugger statements
        drop_debugger: true,
        // Pure functions side-effect removal
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  },
  
  // Optimize server during development
  server: {
    // Enable compression
    compress: true,
    // Optimize dependencies pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'luxon', 'axios']
    }
  },
  
  // Enable asset optimization
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'],
  
  // Configure performance budgets
  experimental: {
    renderBuiltUrl(filename) {
      // Add cache busting for assets
      return `/${filename}?v=${Date.now()}`
    }
  }
})
