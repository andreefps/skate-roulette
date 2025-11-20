import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
    DEGREE_DIE,
    GRIND_DIE,
    ROTATION_DIE,
    STANCE_DIE,
    TRICK_DIE
} from '@/constants/dice';
import { Colors } from '@/constants/theme';
import { CustomConfig, Difficulty, ThemeMode, useSettings } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SettingsScreen() {
  const { 
    difficulty, 
    setDifficulty, 
    themeMode, 
    setThemeMode,
    customConfig,
    toggleCustomItem
  } = useSettings();

  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = Colors[colorScheme].card;
  const borderColor = Colors[colorScheme].border;
  const accentColor = Colors[colorScheme].accent;

  // Collapsible sections state
  const [expandedSection, setExpandedSection] = useState<keyof CustomConfig | null>(null);

  const toggleSection = (section: keyof CustomConfig) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const renderDifficultyOption = (value: Difficulty, label: string) => (
    <TouchableOpacity 
      style={[
        styles.segmentButton, 
        difficulty === value && { backgroundColor: accentColor, borderColor: accentColor },
        { borderColor: borderColor }
      ]}
      onPress={() => setDifficulty(value)}
    >
      <ThemedText style={[
        styles.segmentText, 
        difficulty === value && { color: '#fff', fontWeight: 'bold' },
        difficulty !== value && { color: textColor }
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderThemeOption = (value: ThemeMode, label: string) => (
    <TouchableOpacity 
      style={[
        styles.segmentButton, 
        themeMode === value && { backgroundColor: accentColor, borderColor: accentColor },
        { borderColor: borderColor }
      ]}
      onPress={() => setThemeMode(value)}
    >
      <ThemedText style={[
        styles.segmentText, 
        themeMode === value && { color: '#fff', fontWeight: 'bold' },
        themeMode !== value && { color: textColor }
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderCustomSection = (
    title: string, 
    category: keyof CustomConfig, 
    items: { label: string, value: string }[]
  ) => {
    const isExpanded = expandedSection === category;
    const activeCount = items.length - customConfig[category].filter(v => items.some(i => i.value === v)).length;
    
    return (
      <View style={[styles.sectionContainer, { backgroundColor: cardColor, borderColor }]}>
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection(category)}
        >
          <View>
            <ThemedText type="defaultSemiBold">{title}</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>{activeCount} / {items.length} enabled</ThemedText>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={textColor} 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {items.map((item, index) => {
              if (!item.value) return null; // Skip empty items (X)
              const isEnabled = !customConfig[category].includes(item.value);
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.checkItem, { borderBottomColor: borderColor }]}
                  onPress={() => toggleCustomItem(category, item.value)}
                >
                  <ThemedText>{item.label.replace('\n', ' ')}</ThemedText>
                  <View style={[
                    styles.checkbox, 
                    { borderColor: isEnabled ? accentColor : '#666' },
                    isEnabled && { backgroundColor: accentColor }
                  ]}>
                    {isEnabled && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <ThemedText type="title" style={styles.title}>SETTINGS</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.group}>
          <ThemedText type="subtitle" style={styles.groupTitle}>THEME</ThemedText>
          <View style={styles.segmentContainer}>
            {renderThemeOption('system', 'System')}
            {renderThemeOption('light', 'Light')}
            {renderThemeOption('dark', 'Dark')}
          </View>
        </View>

        <View style={styles.group}>
          <ThemedText type="subtitle" style={styles.groupTitle}>DIFFICULTY</ThemedText>
          <View style={styles.segmentContainer}>
            {renderDifficultyOption('easy', 'Easy')}
            {renderDifficultyOption('medium', 'Medium')}
            {renderDifficultyOption('hard', 'Hard')}
          </View>
          <View style={[styles.segmentContainer, { marginTop: 8 }]}>
            {renderDifficultyOption('custom', 'Custom')}
          </View>
          
          <ThemedText style={styles.description}>
            {difficulty === 'easy' && "Basic tricks only. Regular & Fakie. No 360s."}
            {difficulty === 'medium' && "Adds Switch, Nollie, and more variations."}
            {difficulty === 'hard' && "Everything goes. Good luck."}
            {difficulty === 'custom' && "Customize your trick bag below."}
          </ThemedText>
        </View>

        {difficulty === 'custom' && (
          <View style={styles.group}>
            <ThemedText type="subtitle" style={styles.groupTitle}>CUSTOMIZE</ThemedText>
            {renderCustomSection('Stances', 'stances', STANCE_DIE)}
            {renderCustomSection('Rotations', 'rotations', ROTATION_DIE)}
            {renderCustomSection('Degrees', 'degrees', DEGREE_DIE)}
            {renderCustomSection('Tricks', 'tricks', TRICK_DIE)}
            {renderCustomSection('Grinds', 'grinds', GRIND_DIE)}
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText style={styles.version}>Skate Roulette v1.1.0</ThemedText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  group: {
    marginBottom: 30,
  },
  groupTitle: {
    marginBottom: 15,
    fontSize: 14,
    letterSpacing: 1,
    opacity: 0.7,
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  sectionContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  sectionSubtitle: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  version: {
    fontSize: 10,
    opacity: 0.3,
  },
});
