import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { RouletteSlot } from '@/components/RouletteSlot';
import { ThemedText } from '@/components/themed-text';
import { DICE_SLOTS } from '@/constants/dice';

export default function SkateRouletteScreen() {
  const [areSlotsSpinning, setAreSlotsSpinning] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [results, setResults] = useState<number[]>([0, 0, 0, 0]);
  const [completedSlots, setCompletedSlots] = useState(0);

  const handleSpin = useCallback(() => {
    if (isGameActive) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGameActive(true);
    setAreSlotsSpinning(true);
    setCompletedSlots(0);

    // Generate random results immediately
    const newResults = DICE_SLOTS.map(slot => Math.floor(Math.random() * slot.length));
    setResults(newResults);

    // Stop the spinning after a delay
    // We increase the delay slightly to enjoy the animation
    setTimeout(() => {
      setAreSlotsSpinning(false);
    }, 2500);
  }, [isGameActive]);

  const handleSlotStop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompletedSlots(prev => {
      const next = prev + 1;
      if (next === 4) {
        setIsGameActive(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return next;
    });
  }, []);

  // Helper to format the result text
  const getResultText = () => {
    if (isGameActive) return 'ROLLING...';
    
    const stance = DICE_SLOTS[0][results[0]].value;
    const rotation = DICE_SLOTS[1][results[1]].value;
    const degree = DICE_SLOTS[2][results[2]].value;
    const trick = DICE_SLOTS[3][results[3]].value;

    const parts = [stance, rotation, degree, trick].filter(Boolean);
    if (parts.length === 0) return 'SKATE ROULETTE';
    return parts.join(' ');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>SKATE ROULETTE</ThemedText>
          <View style={styles.divider} />
          <ThemedText style={styles.subtitle}>EST. 2025</ThemedText>
        </View>

        <View style={styles.machineContainer}>
          <View style={styles.machineFrame}>
            <View style={styles.slotsContainer}>
              {DICE_SLOTS.map((slot, index) => (
                <RouletteSlot
                  key={index}
                  index={index}
                  items={slot}
                  targetIndex={results[index]}
                  isSpinning={areSlotsSpinning}
                  onSpinStop={handleSlotStop}
                />
              ))}
            </View>
            {/* Decorative screws/bolts */}
            <View style={[styles.bolt, styles.boltTL]} />
            <View style={[styles.bolt, styles.boltTR]} />
            <View style={[styles.bolt, styles.boltBL]} />
            <View style={[styles.bolt, styles.boltBR]} />
          </View>
        </View>

        <View style={styles.resultContainer}>
          <ThemedText type="subtitle" style={styles.resultText}>
            {getResultText()}
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.spinButton, isGameActive && styles.spinButtonDisabled]}
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
    backgroundColor: '#050505',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: '#050505',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontFamily: 'System', // Or a custom font if available
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#D32F2F',
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
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 240, // 3 * 80
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#222',
  },
  bolt: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: '#222',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  resultText: {
    textAlign: 'center',
    fontSize: 22,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
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
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#B71C1C',
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
    backgroundColor: '#333',
    borderColor: '#222',
    shadowOpacity: 0,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
