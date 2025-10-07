import { create } from 'zustand';
import type { FactCheckResult, VerificationState, VerificationStatus } from '../types/api';

interface FactCheckStoreState extends VerificationState {
  // VerificationState já inclui processedText e fingerprint do shared/types/api.ts
  // Não precisamos redefinir aqui
}

interface FactCheckStoreActions {
  update: (updates: Partial<FactCheckStoreState>) => void;
  setStatus: (status: VerificationStatus, message?: string) => void;
  addResult: (result: FactCheckResult) => void;
  reset: () => void;
}

export type FactCheckStore = FactCheckStoreState & FactCheckStoreActions;

const initialState: FactCheckStoreState = {
  status: 'idle',
  results: [],
  processedText: '',
  fingerprint: null,
};

export const useFactCheckStore = create<FactCheckStore>((set) => ({
  ...initialState,
  update: (updates) => set((state) => ({ ...state, ...updates })),
  setStatus: (status, message) =>
    set((state) => ({
      ...state,
      status,
      message,
    })),
  addResult: (result) =>
    set((state) => ({
      ...state,
      results: [...state.results, result],
    })),
  reset: () =>
    set(() => ({
      ...initialState,
    })),
}));

// Exporta a store para uso no serviço (sem React)
export const factCheckStore = {
  getState: () => useFactCheckStore.getState(),
  setState: (updates: Partial<FactCheckStoreState>) => useFactCheckStore.setState(updates),
  subscribe: (listener: (state: FactCheckStore) => void) => useFactCheckStore.subscribe(listener),
};

export const getFactCheckState = () => useFactCheckStore.getState();

export const setFactCheckState = (
  updates: Partial<FactCheckStoreState>,
) => useFactCheckStore.setState((state) => ({ ...state, ...updates }));

export const resetFactCheckState = () => useFactCheckStore.getState().reset();
