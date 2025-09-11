import { FactCheckResult } from './ws/types.js';

// Simple in-memory cache
const CACHE = new Map<string, FactCheckResult>();

export const setCache = (key: string, value: FactCheckResult): void => { CACHE.set(key, value) };
export const getCache = (key: string): FactCheckResult | undefined => CACHE.get(key);
export const hasCache = (key: string): boolean => CACHE.has(key);
