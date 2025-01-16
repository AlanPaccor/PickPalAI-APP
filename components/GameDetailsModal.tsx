import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialCommunityIcons as MCIType } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Game } from '@/types/sports';
import Colors from '@/constants/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface GameDetailsModalProps {
  game: Game | null;
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type IconName = React.ComponentProps<typeof MCIType>['name'];

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

const getMarketDescription = (marketType: string): string => {
  const descriptions: Record<string, string> = {
    'h2h': 'Straight up winner of the game',
    'spreads': 'Betting with point advantage/disadvantage',
    'totals': 'Combined score of both teams',
    'player_props': 'Individual player performance metrics',
    'team_totals': 'Individual team score total',
    'quarters': 'Quarter by quarter scoring',
    'halves': 'First or second half scoring',
  };
  return descriptions[marketType] || marketType;
};

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  
  if (!game) return null;

  const handleAssistantPress = () => {
    // Create a detailed analysis request
    const gameAnalysisPrompt = `
Please analyze this game prediction:

Player: ${game.player}
Team: ${game.team} vs ${game.opponent}
Sport: ${game.sport}
Position: ${game.position}
Prediction: ${game.prediction} ${game.stat}
Game Time: ${game.time}
Popularity: ${game.popularity}

Please provide:
1. Recent performance analysis
2. Key matchup factors
3. Your opinion on this prediction
`.trim();

    // Close modal and navigate to assistant with the analysis request
    onClose();
    router.push({
      pathname: '/assistant',
      params: {
        type: 'game',
        extractedText: encodeURIComponent(gameAnalysisPrompt)
      }
    });
  };

  const handleAnalyticsPress = () => {
    // Close modal and navigate to analytics with all game details
    onClose();
    router.push({
      pathname: '/analytics',
      params: {
        player: game.player,
        bet: `${game.prediction} ${game.stat}`,
        team: game.team,
        opponent: game.opponent,
        sport: game.sport,
        position: game.position,
        time: game.time,
        popularity: game.popularity
      }
    });
  };

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
            <ThemedText style={styles.modalTitle}>{t('Game Details')}</ThemedText>
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
              <ThemedText style={styles.sectionTitle}>{t('predictionDetails')}</ThemedText>
              <ThemedView style={styles.predictionCard}>
                <ThemedView style={styles.predictionHeader}>
                  <MaterialCommunityIcons name="chart-line" size={20} color="#4CAF50" />
                  <ThemedText style={styles.predictionTitle}>
                    {t('AI Confidence', { percent: 85 })}
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.predictionDesc}>
                  Based on recent performance trends and historical data
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Game Info Section */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('Game Information')}</ThemedText>
              <ThemedView style={styles.infoGrid}>
                <InfoItem 
                  icon="calendar-clock"
                  label={t('Game Time')}
                  value={game.time}
                />
                <InfoItem 
                  icon="account-group"
                  label="Matchup"
                  value={`${game.team} vs ${game.opponent}`}
                />
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('Betting Information')}</ThemedText>
              <ThemedView style={styles.infoGrid}>
                <InfoItem 
                  icon="calendar-clock"
                  label={t('Game Time')}
                  value={game.time}
                />
                <InfoItem 
                  icon="account-group"
                  label="Matchup"
                  value={`${game.team} vs ${game.opponent}`}
                />
                <InfoItem 
                  icon="cash"
                  label="Current Odds"
                  value={game.odds.toFixed(2)}
                />
                <InfoItem 
                  icon="chart-line"
                  label="Line Movement"
                  value={`${(game.odds - 1.8).toFixed(2)}`}
                />
                <InfoItem 
                  icon="percent"
                  label="Implied Probability"
                  value={`${(1 / game.odds * 100).toFixed(1)}%`}
                />
                <InfoItem 
                  icon="chart-bell-curve"
                  label="Market Distribution"
                  value={`${Math.round(100 / game.odds)}% - ${Math.round(100 - (100 / game.odds))}%`}
                />
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('Market Details')}</ThemedText>
              <ThemedView style={styles.marketDetails}>
                <ThemedText style={styles.marketType}>
                  {game.stat} • {game.position}
                </ThemedText>
                <ThemedText style={styles.marketDescription}>
                  {getMarketDescription(game.stat)}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Action Buttons */}
            <ThemedView style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.assistantButton]}
                onPress={handleAssistantPress}
              >
                <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>{t('Get AI Analysis')}</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.analyticsButton]}
                onPress={handleAnalyticsPress}
              >
                <MaterialCommunityIcons name="chart-line" size={24} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>{t('View Analytics')}</ThemedText>
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
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  assistantButton: {
    backgroundColor: '#000040',
  },
  analyticsButton: {
    backgroundColor: '#004000',
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
  marketDetails: {
    padding: 16,
  },
  marketType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  marketDescription: {
    fontSize: 14,
    color: '#FFFFFF80',
  },
}); 