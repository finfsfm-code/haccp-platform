// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// التعديل الحاسم: تحديد المسار الأساسي لـ GitHub Pages.
export default defineConfig({
  base: '/haccp-platform/',
  plugins: [react()],
});