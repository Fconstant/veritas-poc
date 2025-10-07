import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('@ladle/react').UserConfig} */
const config = {
  viteConfig: path.resolve(__dirname, '../vite.config.mjs'),
};

export default config;
