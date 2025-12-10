import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- confirm this import exists

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- confirm this function is called
  ],
  base: "/Bill-splitter-RPL/",
  server: {
    port: 5173,
  },
})
