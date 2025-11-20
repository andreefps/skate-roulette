import { useSettings } from '@/contexts/SettingsContext';
import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme() {
  // We need to be careful here. If this hook is used outside of SettingsProvider,
  // useSettings will throw. 
  // However, in this app, it's mostly used inside screens which are wrapped.
  // For safety, we could try/catch or just assume it's wrapped.
  // Given the architecture, it should be wrapped.
  
  try {
    const { themeMode } = useSettings();
    const systemScheme = useNativeColorScheme();

    if (themeMode === 'system') {
      return systemScheme;
    }
    return themeMode;
  } catch (e) {
    // Fallback if used outside provider (e.g. during initialization or tests)
    return useNativeColorScheme();
  }
}
