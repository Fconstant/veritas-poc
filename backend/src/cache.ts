import { FactCheckResult } from './types.js';

const CHUNK_SIZE = 32;

// Simple in-memory cache
const CACHE = new Map<string, FactCheckResult>();
export const setCache = (key: string, value: FactCheckResult): void => { CACHE.set(key, value) };
export const getCache = (key: string): FactCheckResult | undefined => CACHE.get(key);
export const hasCache = (key: string): boolean => CACHE.has(key);
export const getCacheKey = (text: string): string => Buffer.from(text).toString('base64').slice(0, CHUNK_SIZE);
