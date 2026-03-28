"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { AppState, UserProfile, AnalysisResponse, BurnoutScore, CheckInInput, CheckInResponse } from "@/types";

const STORAGE_KEY = "career-gps-state";

const defaultState: AppState = {
  profile: null,
  analysis: null,
  burnoutScore: null,
  checkIns: [],
  isLoading: false,
  careerCheckpoint: null,
};

interface StoreContextType extends AppState {
  setProfile: (profile: UserProfile) => void;
  setAnalysis: (analysis: AnalysisResponse) => void;
  setBurnoutScore: (score: BurnoutScore) => void;
  addCheckIn: (input: CheckInInput, response: CheckInResponse) => void;
  setLoading: (loading: boolean) => void;
  setCareerCheckpoint: (nodeId: string) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw);
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or blocked — ignore
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setProfile = useCallback((profile: UserProfile) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  const setAnalysis = useCallback((analysis: AnalysisResponse) => {
    setState((s) => ({ ...s, analysis }));
  }, []);

  const setBurnoutScore = useCallback((burnoutScore: BurnoutScore) => {
    setState((s) => ({ ...s, burnoutScore }));
  }, []);

  const addCheckIn = useCallback((input: CheckInInput, response: CheckInResponse) => {
    setState((s) => ({
      ...s,
      checkIns: [...s.checkIns, { input, response, timestamp: new Date().toISOString() }],
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((s) => ({ ...s, isLoading }));
  }, []);

  const setCareerCheckpoint = useCallback((careerCheckpoint: string) => {
    setState((s) => ({ ...s, careerCheckpoint }));
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        ...state,
        setProfile,
        setAnalysis,
        setBurnoutScore,
        addCheckIn,
        setLoading,
        setCareerCheckpoint,
        reset,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
