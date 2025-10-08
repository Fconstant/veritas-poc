import type { NextConfig } from "next";

// Add this temporarily for debugging
console.log('🔍 Environment Debug:');
console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('All NEXT_PUBLIC_ vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
