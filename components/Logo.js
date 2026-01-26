import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const Logo = ({ size = 'medium', showText = true, style }) => {
  const sizes = {
    small: { icon: 32, text: 16, container: 40 },
    medium: { icon: 48, text: 24, container: 60 },
    large: { icon: 64, text: 32, container: 80 },
    xlarge: { icon: 96, text: 48, container: 120 },
  };

  const dimensions = sizes[size] || sizes.medium;

  return (
    <View style={[styles.container, style]}>
      {/* Logo Icon - Lightning Bolt with Location Pin */}
      <View style={[styles.iconContainer, { width: dimensions.container, height: dimensions.container }]}>
        <Svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 100 100"
          style={styles.svg}
        >
          <Defs>
            <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
              <Stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
              <Stop offset="100%" stopColor="#B8860B" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Location Pin Base */}
          <Path
            d="M50 10 C35 10 25 20 25 35 C25 50 50 75 50 75 C50 75 75 50 75 35 C75 20 65 10 50 10 Z"
            fill="url(#goldGradient)"
            opacity="0.3"
          />

          {/* Lightning Bolt */}
          <Path
            d="M55 20 L40 50 L48 50 L45 75 L65 42 L55 42 Z"
            fill="url(#goldGradient)"
            stroke="#FFD700"
            strokeWidth="1.5"
          />

          {/* Center Glow Circle */}
          <Circle
            cx="50"
            cy="45"
            r="8"
            fill="#FFD700"
            opacity="0.4"
          />
        </Svg>
      </View>

      {/* Logo Text */}
      {showText && (
        <Text style={[styles.logoText, { fontSize: dimensions.text }]}>
          City<Text style={styles.logoTextAccent}>Flyers</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  svg: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  logoText: {
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  logoTextAccent: {
    color: '#FFD700',
  },
});

export default Logo;
