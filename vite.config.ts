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
    // Ensure production mode
    minify: 'esbuild',
    target: 'es2015',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // React vendor bundle
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // UI vendor bundle (Radix UI components)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
          ],
          // Supabase bundle
          'supabase': [
            '@supabase/supabase-js',
          ],
          // Form and validation bundle
          'form-vendor': [
            'react-hook-form',
            'zod',
            '@hookform/resolvers',
          ],
          // Query and state management
          'query-vendor': [
            '@tanstack/react-query',
          ],
        },
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
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096, // 4kb - inline small assets as base64
  },
}));
