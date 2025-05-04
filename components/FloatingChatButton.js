import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { COLORS, icons } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

const FloatingChatButton = ({ onPress }) => {
  const { dark } = useTheme();
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(0.85);
  const pulseAnim = new Animated.Value(1);
  
  // Create a subtle pulsing animation when the button is idle
  useEffect(() => {
    const pulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    );
    
    pulsing.start();
    
    return () => pulsing.stop();
  }, []);
  
  const handlePressIn = () => {
    // Scale down and become fully opaque when pressed
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handlePressOut = () => {
    // Return to normal scale and slightly transparent when released
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Combine the press scale effect with the subtle pulse animation
  const combinedScale = Animated.multiply(scaleValue, pulseAnim);

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          transform: [{ scale: combinedScale }],
          opacity: opacityValue
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: COLORS.primary,
            shadowColor: dark ? 'rgba(0, 0, 0, 0.5)' : COLORS.primary,
          }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Image
          source={icons.chatBubble}
          style={styles.icon}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    right: 25,
    zIndex: 100,
  },
  button: {
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowColor: COLORS.primary,
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: COLORS.white,
  },
});

export default FloatingChatButton; 