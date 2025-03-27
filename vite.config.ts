import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // 在这里自定义 Ant Design Vue 主题颜色变量
          'primary-color': '#4F46E5',
          'link-color': '#4F46E5',
          'success-color': '#52c41a',
          'warning-color': '#faad14',
          'error-color': '#f5222d',
          'font-size-base': '14px',
          'heading-color': '#1F2937',
          'text-color': '#374151',
          'text-color-secondary': '#6B7280',
          'disabled-color': '#D1D5DB',
          'border-radius-base': '6px',
          'border-color-base': '#E5E7EB',
          'box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
  server: {
    port: 3003,
    open: true,
  },
});