import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function AccountScreen() {
  const menuItems = [
    { icon: 'account-circle', title: 'Profile Settings', badge: null },
    { icon: 'history', title: 'Betting History', badge: '3' },
    { icon: 'bell', title: 'Notifications', badge: '5' },
    { icon: 'chart-line', title: 'Performance Stats', badge: null },
    { icon: 'cog', title: 'Settings', badge: null },
    { icon: 'help-circle', title: 'Help & Support', badge: null },
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1A5F7A', dark: '#1D3D47' }}
      headerImage={
        <MaterialCommunityIcons 
          name="account" 
          size={120} 
          color="#ffffff50" 
          style={styles.headerIcon} 
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.profileSection}>
          <ThemedView style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#4CAF50" />
          </ThemedView>
          <ThemedText>John Doe</ThemedText>
          <ThemedText>Premium Member</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">85%</ThemedText>
            <ThemedText>Win Rate</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">127</ThemedText>
            <ThemedText>Total Bets</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">$1,240</ThemedText>
            <ThemedText>Profit</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index}>
              <ThemedView style={styles.menuItem}>
                <ThemedView style={styles.menuItemLeft}>
                  <MaterialCommunityIcons name={item.icon} size={24} color="#4CAF50" />
                  <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.menuItemRight}>
                  {item.badge && (
                    <ThemedView style={styles.badge}>
                      <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
                    </ThemedView>
                  )}
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  headerIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  profileSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: Platform.select({ 
      ios: '#00000008', 
      android: '#00000008', 
      web: '#00000008' 
    }),
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Platform.select({ 
      ios: '#00000008', 
      android: '#00000008', 
      web: '#00000008' 
    }),
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
}); 