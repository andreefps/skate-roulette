import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { TrickItem, useHistory } from '@/contexts/HistoryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HistoryScreen() {
  const { history, toggleLanded, deleteTrick, clearHistory } = useHistory();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = Colors[colorScheme].card;
  const borderColor = Colors[colorScheme].border;
  const accentColor = Colors[colorScheme].accent;

  const handleToggleLanded = (id: string) => {
    Haptics.selectionAsync();
    toggleLanded(id);
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteTrick(id);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all tricks?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearHistory();
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: TrickItem }) => (
    <View style={[styles.itemContainer, { backgroundColor: cardColor, borderColor }]}>
      <TouchableOpacity 
        style={[styles.checkbox, { borderColor: colorScheme === 'dark' ? '#444' : '#CCC' }, item.landed && styles.checkboxChecked]} 
        onPress={() => handleToggleLanded(item.id)}
      >
        {item.landed && <IconSymbol name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <ThemedText style={[styles.itemText, { color: textColor }, item.landed && styles.itemTextLanded]}>
          {item.text}
        </ThemedText>
        <ThemedText style={styles.itemMeta}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.mode.toUpperCase()}
        </ThemedText>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
        <IconSymbol name="trash.fill" size={20} color={colorScheme === 'dark' ? '#666' : '#999'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <ThemedText type="title" style={[styles.title, { color: textColor }]}>HISTORY</ThemedText>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <ThemedText style={[styles.clearText, { color: accentColor }]}>Clear</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="clock" size={64} color={colorScheme === 'dark' ? '#333' : '#DDD'} />
          <ThemedText style={[styles.emptyText, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>No tricks yet.</ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colorScheme === 'dark' ? '#444' : '#BBB' }]}>Go spin the wheel!</ThemedText>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  clearText: {
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50', // Green
    borderColor: '#4CAF50',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemTextLanded: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    opacity: 0.8,
  },
  itemMeta: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 8,
  },
});
