import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const BottomNav = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('home')}
      >
        <Text style={[styles.icon, activeTab === 'home' && styles.activeIcon]}>
          🏠
        </Text>
        <Text style={[styles.label, activeTab === 'home' && styles.activeLabel]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, styles.centerTab]}
        onPress={() => onTabPress('create')}
      >
        <View style={styles.createButton}>
          <Text style={styles.createIcon}>+</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('settings')}
      >
        <Text style={[styles.icon, activeTab === 'settings' && styles.activeIcon]}>
          ⚙️
        </Text>
        <Text style={[styles.label, activeTab === 'settings' && styles.activeLabel]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    marginTop: -20,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  createButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FF6B6B',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  createIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default BottomNav;
