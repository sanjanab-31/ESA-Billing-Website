import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('nivo')) return 'vendor-nivo';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            if (id.includes('jspdf')) return 'vendor-jspdf';
            if (id.includes('html2canvas')) return 'vendor-html2canvas';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('date-fns')) return 'vendor-datefns';
            if (id.includes('lodash')) return 'vendor-lodash';
            return 'vendor';
          }
          // Per-page code splitting (for src/pages/*)
          if (id.includes('/src/pages/')) {
            const match = id.match(/src\/pages\/([^/]+)\//);
            if (match && match[1]) {
              return `page-${match[1]}`;
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
