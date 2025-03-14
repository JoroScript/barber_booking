import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Add this to ensure React is properly included
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    tailwindcss()
  ],
  
  // Set the root directory to src/frontend
  root: resolve(__dirname, 'src/frontend'),
  
  // Optimize build configuration
  build: {
    // Output directory relative to the root
    outDir: resolve(__dirname, 'src/frontend/dist'),
    
    // Enable source maps for production debugging if needed
    sourcemap: true, // Enable for debugging
    
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
          'app-context': ['./contexts/BookingContext.jsx'],
        }
      }
    },
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        // Don't remove console logs for debugging
        drop_console: false,
        // Don't remove debugger statements for debugging
        drop_debugger: false,
        // Pure functions side-effect removal
        pure_funcs: []
      }
    }
  },
  
  // Optimize server during development
  server: {
    // Enable compression
    compress: true,
    // Optimize dependencies pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'luxon', 'axios', 'react-calendar']
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
  },
  
  // Define global variables
  define: {
    // Ensure React is available globally
    'window.React': 'React',
    // Make process.env available
    'process.env': process.env,
    // Add React.useState and other hooks to global scope
    'window.useState': 'React.useState',
    'window.useEffect': 'React.useEffect',
    'window.useContext': 'React.useContext',
    'window.useCallback': 'React.useCallback',
    'window.useMemo': 'React.useMemo',
    'window.useRef': 'React.useRef'
  }
})
