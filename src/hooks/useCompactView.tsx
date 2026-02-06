import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CompactViewContextType {
  compactView: boolean;
  setCompactView: (value: boolean) => void;
  toggleCompactView: () => void;
}

const CompactViewContext = createContext<CompactViewContextType | undefined>(undefined);

export function CompactViewProvider({ children }: { children: ReactNode }) {
  const [compactView, setCompactView] = useState(() => {
    const saved = localStorage.getItem("appearanceSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.compactView ?? false;
    }
    return false;
  });

  useEffect(() => {
    // Sync with localStorage when compactView changes
    const saved = localStorage.getItem("appearanceSettings");
    const current = saved ? JSON.parse(saved) : { showAnimations: true };
    localStorage.setItem("appearanceSettings", JSON.stringify({ ...current, compactView }));
  }, [compactView]);

  const toggleCompactView = () => setCompactView((prev) => !prev);

  return (
    <CompactViewContext.Provider value={{ compactView, setCompactView, toggleCompactView }}>
      {children}
    </CompactViewContext.Provider>
  );
}

export function useCompactView() {
  const context = useContext(CompactViewContext);
  if (context === undefined) {
    throw new Error("useCompactView must be used within a CompactViewProvider");
  }
  return context;
}
