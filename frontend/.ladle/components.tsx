import React from "react";
import "../src/app/globals.css";
import type { GlobalProvider } from "@ladle/react";

// Garante que o localStorage está disponível para os stories
if (typeof window !== 'undefined' && !window.localStorage) {
  console.warn('localStorage não disponível, criando mock');
  const storage: Record<string, string> = {};
  (window as any).localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
    key: (index: number) => Object.keys(storage)[index] || null,
    get length() { return Object.keys(storage).length; }
  };
}

export const Provider: GlobalProvider = ({ children }) => <>{children}</>;
