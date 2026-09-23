import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { listStudios, type Studio } from "../lib/api/studios";

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
  const { session } = useAuth();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [currency, setCurrency] = useState((session?.user.user_metadata?.currency as string | undefined) ?? "EUR");

  // When setup is re-run from Settings, start from the studios that already exist.
  useEffect(() => {
    listStudios()
      .then((s) => setStudios((prev) => (prev.length ? prev : s)))
      .catch(() => {});
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        studios,
        setStudios,
        addStudio: (s) => setStudios((prev) => [...prev, s]),
        removeStudio: (id) => setStudios((prev) => prev.filter((s) => s.id !== id)),
        currency,
        setCurrency,
      }}
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
