import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LogoText = ({ size = 'medium', style, color = 'coral' }) => {
  const sizes = {
    xsmall: { text: 14 },
    small: { text: 18 },
    medium: { text: 28 },
    large: { text: 36 },
    xlarge: { text: 48 },
  };

  const colors = {
    coral: {
      icon: '#FF6B6B',
      text: '#fff',
      accent: '#FF6B6B',
    },
    gold: {
      icon: '#FFD700',
      text: '#D4AF37',
      accent: '#FFD700',
    },
    white: {
      icon: '#fff',
      text: '#fff',
      accent: 'rgba(255, 255, 255, 0.8)',
    },
    purple: {
      icon: '#764ba2',
      text: '#667eea',
      accent: '#764ba2',
    },
  };

  const dimensions = sizes[size] || sizes.medium;
  const colorScheme = colors[color] || colors.coral;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize: dimensions.text, color: colorScheme.text }]}>
        City<Text style={[styles.accent, { color: colorScheme.accent }]}>Flyers</Text>
        <Text style={[styles.dot, { color: colorScheme.accent }]}>.</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  accent: {
    fontWeight: '400',
  },
  dot: {
    fontWeight: '700',
  },
});

export default LogoText;
