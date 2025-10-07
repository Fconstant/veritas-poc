import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin para remover diretivas "use client" e "use server" do Next.js
const removeNextJsDirectives = () => ({
  name: 'remove-nextjs-directives',
  transform(code, id) {
    if (id.includes('node_modules')) return null;
    if (!id.match(/\.(tsx?|jsx?)$/)) return null;
    
    // Remove "use client" e "use server" do início dos arquivos
    const transformed = code
      .replace(/^['"]use client['"];?\s*/m, '')
      .replace(/^['"]use server['"];?\s*/m, '');
    
    if (transformed !== code) {
      return { code: transformed, map: null };
    }
    return null;
  }
});

export default {
  plugins: [removeNextJsDirectives()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Mock Next.js modules for Ladle
      'next/link': path.resolve(__dirname, './.ladle/mocks/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './.ladle/mocks/next-navigation.tsx'),
      // Mock factCheckService to avoid WebSocket issues in Ladle
      '@/lib/services/factCheckService': path.resolve(__dirname, './.ladle/mocks/factCheckService.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['socket.io-client'], // Exclui socket.io-client da otimização
  },
};
