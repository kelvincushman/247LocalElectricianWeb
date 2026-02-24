import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["247electrician.uk", "www.247electrician.uk"],
    hmr: {
      clientPort: 443,
      protocol: "wss",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3247',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3247',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk splitting for better caching and smaller initial load
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-tooltip'],
          'framer': ['framer-motion'],
          'leaflet': ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Use esbuild for minification (faster than terser, default in Vite)
    minify: 'esbuild',
    // Set chunk size warning to 250KB
    chunkSizeWarningLimit: 250,
  },
}));
