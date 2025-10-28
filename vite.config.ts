

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// هذا الإعداد هو المفتاح: يوجه Vite لاستخدام اسم المستودع كمسار أساسي (Base Path)
export default defineConfig({
  base: '/haccp-platform/',
  plugins: [react()],
});