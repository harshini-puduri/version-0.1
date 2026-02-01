'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MascotColors {
  primary: string;
  secondary: string;
  accent: string;
  blush: string;
}

interface MascotColorsContextType {
  colors: MascotColors;
  setColors: (colors: MascotColors) => void;
  resetColors: () => void;
}

const defaultColors: MascotColors = {
  primary: "#FFCA28",
  secondary: "#FFE082",
  accent: "#FFF9C4",
  blush: "#FFAB91"
};

const MascotColorsContext = createContext<MascotColorsContextType | undefined>(undefined);

export function MascotColorsProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<MascotColors>(defaultColors);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load colors from localStorage on mount
  useEffect(() => {
    const savedColors = localStorage.getItem('mascotColors');
    if (savedColors) {
      try {
        setColorsState(JSON.parse(savedColors));
      } catch (e) {
        console.error('Failed to parse saved colors:', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save colors to localStorage whenever they change
  const setColors = (newColors: MascotColors) => {
    setColorsState(newColors);
    localStorage.setItem('mascotColors', JSON.stringify(newColors));
  };

  const resetColors = () => {
    setColorsState(defaultColors);
    localStorage.setItem('mascotColors', JSON.stringify(defaultColors));
  };

  // Don't render until we've loaded from localStorage
  if (!isInitialized) {
    return null;
  }

  return (
    <MascotColorsContext.Provider value={{ colors, setColors, resetColors }}>
      {children}
    </MascotColorsContext.Provider>
  );
}

export function useMascotColors() {
  const context = useContext(MascotColorsContext);
  if (context === undefined) {
    throw new Error('useMascotColors must be used within a MascotColorsProvider');
  }
  return context;
}
