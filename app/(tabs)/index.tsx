import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RouletteSlot } from '@/components/RouletteSlot';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useHistory } from '@/contexts/HistoryContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SkateRouletteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = Colors[colorScheme].card;
  const borderColor = Colors[colorScheme].border;
  const goldColor = Colors[colorScheme].gold;
  const accentColor = Colors[colorScheme].accent;

  const { getEnabledSlots, difficulty } = useSettings();

  const [gameMode, setGameMode] = useState<'flatground' | 'ledge'>('flatground');
  const [areSlotsSpinning, setAreSlotsSpinning] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [results, setResults] = useState<number[]>([0, 0, 0, 0]);
  const [completedSlots, setCompletedSlots] = useState(0);

  // Get slots based on current settings
  // We use useMemo to prevent unnecessary re-renders unless difficulty/custom config changes
  // But getEnabledSlots is a function, so we depend on the context values that trigger re-renders.
  // Since useSettings() triggers re-render on change, we can just call it.
  const currentSlots = useMemo(() => getEnabledSlots(gameMode), [gameMode, getEnabledSlots, difficulty]);

  // Reset results when slots configuration changes significantly (e.g. difficulty change)
  // to avoid out-of-bounds errors if the new slots are shorter (though they shouldn't be shorter in length, just content)
  useEffect(() => {
    setResults([0, 0, 0, 0]);
  }, [difficulty]);

  const handleModeToggle = () => {
    if (isGameActive) return;
    Haptics.selectionAsync();
    setGameMode(prev => prev === 'flatground' ? 'ledge' : 'flatground');
    setResults([0, 0, 0, 0]); // Reset results
  };

  const handleSpin = useCallback(() => {
    if (isGameActive) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGameActive(true);
    setAreSlotsSpinning(true);
    setCompletedSlots(0);

    // Generate random results immediately
    const newResults = currentSlots.map(slot => Math.floor(Math.random() * slot.length));
    setResults(newResults);

    // Stop the spinning after a delay
    // We increase the delay slightly to enjoy the animation
    setTimeout(() => {
      setAreSlotsSpinning(false);
    }, 2500);
  }, [isGameActive]);

  const { addTrick } = useHistory();

  const handleSlotStop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompletedSlots(prev => {
      const next = prev + 1;
      if (next === 4) {
        setIsGameActive(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Save to history
        // We need to calculate the text here since state updates are async/batched
        // But 'results' state is stable since spin start.
        // Wait, 'results' is state. We can use the helper but we need to be careful about closure.
        // Actually, we can just reconstruct the text logic here or use a ref.
        // Or better, use a useEffect to watch 'completedSlots'.
      }
      return next;
    });
  }, []);

  // Effect to save history when game finishes
  React.useEffect(() => {
    if (completedSlots === 4 && !isGameActive) {
      const text = getResultText();
      // Avoid saving "ROLLING..." or initial state if that happens
      if (text !== 'ROLLING...' && text !== "SKATER'S CHOICE") {
         addTrick(text, gameMode);
      }
    }
  }, [completedSlots, isGameActive]);

  // Helper to format the result text
  const getResultText = () => {
    if (isGameActive) return 'ROLLING...';
    
    // Helper for safe access to prevent crashes during mode switch
    const getSafeValue = (slotIndex: number, resultIndex: number) => {
      const slot = currentSlots[slotIndex];
      if (!slot) return '';
      const item = slot[resultIndex];
      // Fallback to first item if index is out of bounds (e.g. switching from 10 items to 4 items)
      return item ? item.value : slot[0]?.value || '';
    };

    if (gameMode === 'flatground') {
      let stance = getSafeValue(0, results[0]);
      const rotation = getSafeValue(1, results[1]);
      const degree = getSafeValue(2, results[2]);
      const trick = getSafeValue(3, results[3]);

      if (stance === 'Regular') stance = '';

      const parts = [stance, rotation, degree, trick].filter(Boolean);

      if (parts.length === 0) return "SKATER'S CHOICE";
      if (!trick) return 'ANYTHING ' + parts.join(' ').toUpperCase();

      return parts.join(' ').toUpperCase();
    } else {
      // Ledge Mode
      let stance = getSafeValue(0, results[0]);
      const grind = getSafeValue(1, results[1]);
      const rotation = getSafeValue(2, results[2]);
      const tries = getSafeValue(3, results[3]);

      if (stance === 'Regular') stance = '';

      const trickParts = [stance, rotation, grind].filter(Boolean);
      const trickName = trickParts.length > 0 ? trickParts.join(' ').toUpperCase() : "SKATER'S CHOICE";
      
      return `${trickName}\n${tries.toUpperCase()}`;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: textColor }]}>SKATE ROULETTE</ThemedText>
          <View style={[styles.divider, { backgroundColor: accentColor }]} />
          
          <View style={[styles.modeSwitcher, { backgroundColor: cardColor, borderColor }]}>
            <TouchableOpacity 
              style={[styles.modeButton, gameMode === 'flatground' && { backgroundColor: borderColor }]} 
              onPress={() => gameMode !== 'flatground' && handleModeToggle()}
            >
              <ThemedText style={[styles.modeText, gameMode === 'flatground' && { color: textColor }]}>FLAT</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeButton, gameMode === 'ledge' && { backgroundColor: borderColor }]} 
              onPress={() => gameMode !== 'ledge' && handleModeToggle()}
            >
              <ThemedText style={[styles.modeText, gameMode === 'ledge' && { color: textColor }]}>LEDGE</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.machineContainer}>
          <View style={[styles.machineFrame, { backgroundColor: cardColor, borderColor }]}>
            <View style={[styles.slotsContainer, { backgroundColor: colorScheme === 'dark' ? '#000' : '#F0F0F0', borderColor }]}>
              {currentSlots.map((slot, index) => (
                <RouletteSlot
                  key={`${gameMode}-${index}`} // Force re-render on mode change
                  index={index}
                  items={slot}
                  targetIndex={results[index]}
                  isSpinning={areSlotsSpinning}
                  onSpinStop={handleSlotStop}
                />
              ))}
            </View>
            {/* Decorative screws/bolts */}
            <View style={[styles.bolt, styles.boltTL, { borderColor }]} />
            <View style={[styles.bolt, styles.boltTR, { borderColor }]} />
            <View style={[styles.bolt, styles.boltBL, { borderColor }]} />
            <View style={[styles.bolt, styles.boltBR, { borderColor }]} />
          </View>
        </View>

        <View style={[styles.resultContainer, { borderColor: borderColor, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
          <ThemedText type="subtitle" style={[styles.resultText, { color: goldColor, textShadowColor: colorScheme === 'dark' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(184, 134, 11, 0.2)' }]}>
            {getResultText()}
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.spinButton, { backgroundColor: accentColor, borderColor: colorScheme === 'dark' ? '#B71C1C' : '#C62828' }, isGameActive && styles.spinButtonDisabled]}
            onPress={handleSpin}
            disabled={isGameActive}
            activeOpacity={0.9}
          >
            <View style={styles.spinButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.spinButtonText}>
                {isGameActive ? '...' : 'SPIN'}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  divider: {
    width: 40,
    height: 2,
    marginVertical: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 2,
  },
  machineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  machineFrame: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 240, // 3 * 80
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
  },
  bolt: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    borderWidth: 1,
  },
  boltTL: { top: 6, left: 6 },
  boltTR: { top: 6, right: 6 },
  boltBL: { bottom: 6, left: 6 },
  boltBR: { bottom: 6, right: 6 },
  
  resultContainer: {
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  footer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  spinButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 4,
  },
  spinButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinButtonDisabled: {
    backgroundColor: '#666',
    borderColor: '#444',
    shadowOpacity: 0,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    marginTop: 10,
  },
  modeButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  modeText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
});
