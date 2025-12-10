import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Billsplitterapp/", // <--- CHANGE THIS to your actual GitHub repository name
  server: {
    port: 5173,
  },
});