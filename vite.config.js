import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/semences-despoir-admin/',
  plugins: [react()],
});
