import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://tropical-acai-back.onrender.com', // URL do backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
