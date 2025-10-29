// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// اسم المستودع هو 'haccp-platform' كما يظهر في الرابط
const REPO_NAME = 'haccp-platform';

export default defineConfig({
  // **هذا هو الإعداد الرئيسي لحل مشكلة 404:**
  base: `/${REPO_NAME}/`,
  plugins: [react()],
});