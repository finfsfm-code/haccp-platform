// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// تحديد مسار النشر الفرعي لـ GitHub Pages. يجب أن يطابق اسم المستودع.
export default defineConfig({
  base: '/haccp-platform/',
  plugins: [react()],
});