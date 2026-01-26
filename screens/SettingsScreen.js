import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import LogoText from '../components/LogoText';
import BottomNav from '../components/BottomNav';

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleTabPress = (tab) => {
    if (tab === 'home') {
      navigation.navigate('HomeFeed');
    } else if (tab === 'create') {
      navigation.navigate('AddFlyer');
    } else if (tab === 'settings') {
      // Already on settings
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleThemeToggle = (value) => {
    setIsDarkMode(value);
    if (!value) {
      Alert.alert(
        'Light Mode',
        'Light mode will be available in a future update. Dark mode is currently the only theme.',
        [{ text: 'OK' }]
      );
      setIsDarkMode(true);
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, danger, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showArrow && <Text style={styles.settingArrow}>›</Text>}
    </TouchableOpacity>
  );

  const SettingItemWithSwitch = ({ icon, title, subtitle, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2a2a2a', true: '#FF6B6B' }}
        thumbColor={value ? '#fff' : '#666'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LogoText size="medium" color="coral" />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon="👤"
              title="Profile Details"
              subtitle="View and edit your profile"
              onPress={() => Alert.alert('Profile Details', `Name: ${user?.firstName || 'User'}\nEmail: ${user?.emailAddresses?.[0]?.emailAddress || 'No email'}\n\nProfile editing will be available soon.`)}
            />
            <SettingItem
              icon="🔔"
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
            />
            <SettingItem
              icon="🔒"
              title="Privacy"
              subtitle="Control your privacy settings"
              onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon')}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingsList}>
            <SettingItemWithSwitch
              icon="🌙"
              title="Dark Mode"
              subtitle={isDarkMode ? 'Currently enabled' : 'Currently disabled'}
              value={isDarkMode}
              onValueChange={handleThemeToggle}
            />
          </View>
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon="📍"
              title="Location"
              subtitle="Manage location permissions"
              onPress={() => Alert.alert('Coming Soon', 'Location settings will be available soon')}
            />
            <SettingItem
              icon="📱"
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert('City Flyers', 'Version 1.0.0\n\nA hyperlocal flyer discovery app')}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav activeTab="settings" onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#FF6B6B',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#999',
  },
  settingsList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  settingArrow: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF6B6B',
  },
});

export default SettingsScreen;
