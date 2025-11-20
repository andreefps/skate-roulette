import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { DieFace } from '@/constants/dice';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const ITEM_HEIGHT = 80; 


interface RouletteSlotProps {
  items: DieFace[];
  targetIndex: number;
  isSpinning: boolean;
  onSpinStop?: () => void;
  index: number;
}

// Re-implementing with the "Render All" approach
export function RouletteSlot({ items, targetIndex, isSpinning, onSpinStop, index }: RouletteSlotProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = Colors[colorScheme].border;
  
  const scrollY = useSharedValue(0);
  const itemHeight = ITEM_HEIGHT;
  const repeatCount = 12; // Increased to ensure we don't run out of items
  const totalListHeight = items.length * itemHeight;
  const fullHeight = totalListHeight * repeatCount;

  useEffect(() => {
    if (isSpinning) {
      // Reset to middle-ish to allow movement in both directions if needed, 
      // but we only go down (negative Y).
      // Let's start at a multiple of totalListHeight
      const startOffset = -(Math.floor(repeatCount / 2) * totalListHeight);
      // Actually, just keep current modulus
      const currentMod = scrollY.value % totalListHeight;
      scrollY.value = currentMod - totalListHeight; // Reset to top-ish

      const speed = 1500 + (index * 200);
      
      scrollY.value = withRepeat(
        withTiming(scrollY.value - totalListHeight, {
          duration: speed,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(scrollY);
      const currentY = scrollY.value;
      
      // Find target
      // We want to stop at `targetIndex`
      // Target offset within one list is `-targetIndex * itemHeight`
      // We add `itemHeight` because we want the item to be in the middle (index 1 of the view), not the top (index 0)
      let targetBase = (-(targetIndex * itemHeight) + itemHeight) % totalListHeight;
      if (targetBase > 0) targetBase -= totalListHeight;
      
      // Find the next occurrence of targetBase below currentY
      const currentMod = currentY % totalListHeight;
      let dist = targetBase - currentMod;
      
      // Ensure we only move DOWN (negative direction)
      while (dist > 0) {
        dist -= totalListHeight;
      }
      
      // Add extra spins
      const extraSpins = 2 + index;
      const finalY = currentY + dist - (extraSpins * totalListHeight);
      
      scrollY.value = withSpring(finalY, {
        damping: 18,
        stiffness: 100,
        mass: 1,
      }, (finished) => {
        if (finished && onSpinStop) {
          runOnJS(onSpinStop)();
        }
      });
    }
  }, [isSpinning, targetIndex, items, totalListHeight, index]);

  // Render the list repeated
  const allItems = Array(repeatCount).fill(items).flat();

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#F0F0F0', borderColor }]}>
       <View style={[styles.gradientTop, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(240,240,240,0.8)', borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} pointerEvents="none" />
       <View style={[styles.gradientBottom, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(240,240,240,0.8)', borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} pointerEvents="none" />
       <View style={[styles.selectionLine, { borderColor: colorScheme === 'dark' ? 'rgba(255, 215, 0, 0.5)' : 'rgba(184, 134, 11, 0.5)', backgroundColor: colorScheme === 'dark' ? 'rgba(255, 215, 0, 0.05)' : 'rgba(184, 134, 11, 0.05)' }]} pointerEvents="none" />
       
       <View style={styles.scrollContainer}>
         {allItems.map((item, i) => (
           <SlotItem 
             key={i} 
             index={i} 
             item={item} 
             scrollY={scrollY} 
             itemHeight={itemHeight}
             totalItems={allItems.length}
           />
         ))}
       </View>
    </View>
  );
}

const SlotItem = ({ index, item, scrollY, itemHeight, totalItems }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate position relative to the center of the container
    // The container center is at Y=0 visually (if we center the view).
    // But we are scrolling the content.
    // Let's say container height is 3 * itemHeight. Center is 1.5 * itemHeight.
    // Item Y = index * itemHeight + scrollY.
    // Center of item = Item Y + itemHeight / 2.
    // Distance from center = (index * itemHeight + scrollY + itemHeight/2) - (ContainerCenter).
    
    // Let's assume the container is centered around 0 for calculation simplicity
    // and we offset it visually.
    
    const itemY = (index * itemHeight) + scrollY.value;
    const centerOffset = itemHeight * 1.5; // Assuming 3 items visible
    const distFromCenter = itemY + (itemHeight / 2) - centerOffset;
    
    // 3D Transforms
    const rotateX = interpolate(
      distFromCenter,
      [-itemHeight * 2, 0, itemHeight * 2],
      [60, 0, -60],
      Extrapolation.CLAMP
    );
    
    const scale = interpolate(
      distFromCenter,
      [-itemHeight * 2, 0, itemHeight * 2],
      [0.6, 1.1, 0.6], // Pop the center item
      Extrapolation.CLAMP
    );
    
    const opacity = interpolate(
      distFromCenter,
      [-itemHeight * 2, 0, itemHeight * 2],
      [0.2, 1, 0.2],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 500 },
        { translateY: itemY }, // Move the item
        { rotateX: `${rotateX}deg` },
        { scale },
      ],
      opacity,
      position: 'absolute',
      top: 0,
      width: '100%',
      height: itemHeight,
      justifyContent: 'center',
      alignItems: 'center',
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText 
        type="defaultSemiBold" 
        style={[styles.text, { textShadowColor: 'rgba(0,0,0,0.3)' }]} 
        lightColor="#1C1C1E" 
        darkColor="#fff"
      >
        {item.label}
      </ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * 3,
    width: '25%',
    overflow: 'hidden',
    borderRightWidth: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectionLine: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    zIndex: 20,
    borderBottomWidth: 1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    zIndex: 20,
    borderTopWidth: 1,
  },
  // Unused but kept for reference
  slotWindow: {},
});


