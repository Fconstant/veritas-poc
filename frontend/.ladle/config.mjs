import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('@ladle/react').UserConfig} */
export default {
  viteConfig: path.resolve(__dirname, '../vite.config.mjs'),
};
