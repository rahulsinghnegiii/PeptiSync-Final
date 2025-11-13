import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: mode === "development" ? [
      "localhost",
      "127.0.0.1",
      "peptisync-final.onrender.com",
      "peptisync-nova.onrender.com",
      ".onrender.com",
      "peptisync.com"
    ] : undefined,
  },
  plugins: [
    react({
      // Ensure proper JSX runtime for production
      jsxRuntime: 'automatic',
    }), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  define: {
    // Ensure proper production mode
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure production mode with aggressive optimization
    minify: 'esbuild',
    target: 'es2015',
    sourcemap: false,
    // Reduce chunk size to save memory during build
    chunkSizeWarningLimit: 500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets - reduce inline limit to save memory
    assetsInlineLimit: 2048, // 2kb - reduced from 4kb
    rollupOptions: {
      output: {
        // More aggressive code splitting to reduce memory usage
        manualChunks: (id) => {
          // Split node_modules into smaller chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core';
            }
            // Radix UI - split into smaller chunks
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms';
            }
            // Stripe
            if (id.includes('@stripe')) {
              return 'stripe';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // UI utilities
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-utils';
            }
            // Other vendor code
            return 'vendor';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        // Add asset file names with hash for cache busting
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          
          // Images get their own directory with hash
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          // Fonts get their own directory
          if (/woff2?|ttf|otf|eot/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
      },
      // Optimize dependencies to reduce bundle size
      external: [],
    },
  },
}));
