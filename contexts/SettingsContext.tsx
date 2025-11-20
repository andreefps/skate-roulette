import {
    DEGREE_DIE,
    DieFace,
    GRIND_DIE,
    ROTATION_DIE,
    STANCE_DIE,
    TRICK_DIE,
    TRIES_DIE
} from '@/constants/dice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';
export type ThemeMode = 'system' | 'light' | 'dark';

// Map of category -> array of values that are disabled
export type CustomConfig = {
  stances: string[];
  rotations: string[];
  degrees: string[];
  tricks: string[];
  grinds: string[];
};

interface SettingsContextType {
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  customConfig: CustomConfig;
  toggleCustomItem: (category: keyof CustomConfig, value: string) => void;
  getEnabledSlots: (mode: 'flatground' | 'ledge') => DieFace[][];
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = '@skate_roulette_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  
  // Default: nothing disabled
  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    stances: [],
    rotations: [],
    degrees: [],
    tricks: [],
    grinds: [],
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change (debounced slightly ideally, but direct is fine for now)
  useEffect(() => {
    if (!isLoading) {
      saveSettings();
    }
  }, [difficulty, themeMode, customConfig]);

  const loadSettings = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.themeMode) setThemeMode(data.themeMode);
        if (data.customConfig) setCustomConfig(data.customConfig);
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const data = {
        difficulty,
        themeMode,
        customConfig,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  const toggleCustomItem = (category: keyof CustomConfig, value: string) => {
    setCustomConfig(prev => {
      const currentList = prev[category];
      const exists = currentList.includes(value);
      let newList;
      
      if (exists) {
        newList = currentList.filter(item => item !== value);
      } else {
        newList = [...currentList, value];
      }
      
      return {
        ...prev,
        [category]: newList
      };
    });
  };

  const getEnabledSlots = (mode: 'flatground' | 'ledge'): DieFace[][] => {
    // Helper to filter a die based on config
    const filterDie = (die: DieFace[], category: keyof CustomConfig, defaultFilter?: (item: DieFace) => boolean) => {
      if (difficulty === 'custom') {
        // In custom mode, filter out items that are in the disabled list
        // If the list is empty, everything is enabled (unless we want opt-in?)
        // Let's assume opt-out: everything enabled by default, user disables specific ones.
        return die.filter(item => !customConfig[category].includes(item.value));
      }
      
      // Presets
      if (defaultFilter) {
        return die.filter(defaultFilter);
      }
      
      return die;
    };

    // PRESET LOGIC
    const isEasy = difficulty === 'easy';
    const isMedium = difficulty === 'medium';
    // Hard is all enabled by default

    // STANCE
    const stanceFilter = (item: DieFace) => {
      if (isEasy) return ['Regular', 'Fakie'].includes(item.value);
      if (isMedium) return ['Regular', 'Fakie', 'Switch', 'Nollie'].includes(item.value); // Medium has all stances? Or maybe just Reg/Fakie/Nollie? Let's say all for Medium.
      return true;
    };
    
    // ROTATION
    const rotationFilter = (item: DieFace) => {
      if (isEasy) return item.value === '' || item.value === 'Backside' || item.value === 'Frontside'; // No complex rotations if we had them? Actually rotation die is simple.
      return true;
    };

    // DEGREE
    const degreeFilter = (item: DieFace) => {
      if (isEasy) return item.value === '' || item.value === '180'; // No 360s in easy
      return true;
    };

    // TRICK
    const trickFilter = (item: DieFace) => {
      if (isEasy) return ['Kickflip', 'Heelflip', ''].includes(item.value); // Basic flips only
      return true;
    };

    // GRIND
    const grindFilter = (item: DieFace) => {
      if (isEasy) return ['50-50', 'Boardslide', 'Noseslide', 'Tailslide'].includes(item.value);
      if (isMedium) return !['Bluntslide', 'Noseblunt'].includes(item.value); // Exclude hardest if we had them
      return true;
    };

    const filteredStance = filterDie(STANCE_DIE, 'stances', stanceFilter);
    const filteredRotation = filterDie(ROTATION_DIE, 'rotations', rotationFilter);
    
    if (mode === 'flatground') {
      const filteredDegree = filterDie(DEGREE_DIE, 'degrees', degreeFilter);
      const filteredTrick = filterDie(TRICK_DIE, 'tricks', trickFilter);
      
      // Ensure we don't return empty arrays, fallback to full die if filtered to nothing
      return [
        filteredStance.length ? filteredStance : STANCE_DIE,
        filteredRotation.length ? filteredRotation : ROTATION_DIE,
        filteredDegree.length ? filteredDegree : DEGREE_DIE,
        filteredTrick.length ? filteredTrick : TRICK_DIE,
      ];
    } else {
      const filteredGrind = filterDie(GRIND_DIE, 'grinds', grindFilter);
      
      return [
        filteredStance.length ? filteredStance : STANCE_DIE,
        filteredGrind.length ? filteredGrind : GRIND_DIE,
        filteredRotation.length ? filteredRotation : ROTATION_DIE,
        TRIES_DIE, // Tries usually not filtered
      ];
    }
  };

  return (
    <SettingsContext.Provider value={{
      difficulty,
      setDifficulty,
      themeMode,
      setThemeMode,
      customConfig,
      toggleCustomItem,
      getEnabledSlots,
      isLoading
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
