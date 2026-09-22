import { createContext, useContext, useState } from "react";
import type { Studio } from "../lib/api/studios";

type OnboardingContextValue = {
  studios: Studio[];
  setStudios: (studios: Studio[]) => void;
  addStudio: (studio: Studio) => void;
  removeStudio: (id: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [currency, setCurrency] = useState("EUR");

  function addStudio(studio: Studio) {
    setStudios((prev) => [...prev, studio]);
  }

  function removeStudio(id: string) {
    setStudios((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <OnboardingContext.Provider
      value={{ studios, setStudios, addStudio, removeStudio, currency, setCurrency }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
