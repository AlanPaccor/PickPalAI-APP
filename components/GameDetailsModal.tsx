import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Game } from '@/types/sports';
import Colors from '@/constants/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface GameDetailsModalProps {
  game: Game | null;
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getSportIcon = (sportKey: string): IconName => {
  const iconMap: Record<string, IconName> = {
    'basketball': 'basketball',
    'americanfootball': 'football',
    'baseball': 'baseball-bat',
    'icehockey': 'hockey-puck',
    'soccer': 'soccer',
    'tennis': 'tennis',
  };
  
  return iconMap[sportKey] || 'help-circle';
};

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  visible,
  onClose,
}) => {
  if (!game) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable 
          style={styles.dismissArea}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          {/* Handle */}
          <ThemedView style={styles.handle} />
          
          {/* Header */}
          <ThemedView style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF80" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Game Details</ThemedText>
          </ThemedView>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
            bounces={true}
            scrollEventThrottle={16}
          >
            {/* Player Info Section */}
            <ThemedView style={styles.heroSection}>
              <ThemedView style={styles.sportIconContainer}>
                <MaterialCommunityIcons 
                  name={getSportIcon(game.sport)}
                  size={40} 
                  color="white"
                />
              </ThemedView>
              <ThemedText style={styles.playerName}>{game.player}</ThemedText>
              <ThemedText style={styles.teamInfo}>
                {game.team} • {game.position}
              </ThemedText>
            </ThemedView>

            {/* Stats Cards */}
            <ThemedView style={styles.statsGrid}>
              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statValue}>{game.prediction}</ThemedText>
                <ThemedText style={styles.statLabel}>{game.stat}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statCard}>
                <ThemedView style={styles.popularityIcon}>
                  <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
                </ThemedView>
                <ThemedText style={styles.statValue}>{game.popularity}</ThemedText>
                <ThemedText style={styles.statLabel}>Popularity</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Prediction Details</ThemedText>
              <ThemedView style={styles.predictionCard}>
                <ThemedView style={styles.predictionHeader}>
                  <MaterialCommunityIcons name="chart-line" size={20} color="#4CAF50" />
                  <ThemedText style={styles.predictionTitle}>AI Confidence: 85%</ThemedText>
                </ThemedView>
                <ThemedText style={styles.predictionDesc}>
                  Based on recent performance trends and historical data
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Game Info Section */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Game Information</ThemedText>
              <ThemedView style={styles.infoGrid}>
                <InfoItem 
                  icon="calendar-clock"
                  label="Game Time"
                  value={game.time}
                />
                <InfoItem 
                  icon="account-group"
                  label="Matchup"
                  value={`${game.team} vs ${game.opponent}`}
                />
              </ThemedView>
            </ThemedView>

            {/* Action Buttons */}
            <ThemedView style={styles.actionButtons}>
              <TouchableOpacity style={styles.assistantButton}>
                <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>Assistant</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const InfoItem = ({ icon, label, value }: { 
  icon: string; 
  label: string; 
  value: string;
}) => (
  <ThemedView style={styles.infoItem}>
    <ThemedView style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon as any} size={24} color="#FFFFFF80" />
    </ThemedView>
    <ThemedView>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </ThemedView>
  </ThemedView>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#000010',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: SCREEN_HEIGHT * 0.7,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderColor: '#FFFFFF30',
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#FFFFFF30',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  sportIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000010',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  teamInfo: {
    fontSize: 18,
    color: '#FFFFFF80',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#000010',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  popularityIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF80',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#FFFFFF80',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    padding: 16,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  assistantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000040',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  predictionCard: {
    backgroundColor: '#000010',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    backgroundColor: '#000010',
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  predictionDesc: {
    fontSize: 14,
    color: '#FFFFFF80',
    lineHeight: 20,
  },
}); 