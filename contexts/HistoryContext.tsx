import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type TrickItem = {
  id: string;
  text: string;
  timestamp: number;
  landed: boolean;
  mode: 'flatground' | 'ledge';
};

interface HistoryContextType {
  history: TrickItem[];
  addTrick: (text: string, mode: 'flatground' | 'ledge') => void;
  toggleLanded: (id: string) => void;
  deleteTrick: (id: string) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HISTORY_STORAGE_KEY = '@skate_roulette_history';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<TrickItem[]>([]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (jsonValue != null) {
        setHistory(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  const saveHistory = async (newHistory: TrickItem[]) => {
    try {
      const jsonValue = JSON.stringify(newHistory);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  const addTrick = (text: string, mode: 'flatground' | 'ledge') => {
    const newTrick: TrickItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      landed: false,
      mode,
    };
    
    const newHistory = [newTrick, ...history];
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const toggleLanded = (id: string) => {
    const newHistory = history.map(item => 
      item.id === id ? { ...item, landed: !item.landed } : item
    );
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const deleteTrick = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <HistoryContext.Provider value={{ history, addTrick, toggleLanded, deleteTrick, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
