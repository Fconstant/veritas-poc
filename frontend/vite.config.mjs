import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Mock Next.js modules for Ladle
      'next/link': path.resolve(__dirname, './.ladle/mocks/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './.ladle/mocks/next-navigation.tsx'),
    },
  },
};
