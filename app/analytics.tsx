import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { ThemedView } from './components/ThemedView';
import { ThemedText } from './components/ThemedText';
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { LineChart, LineChartProvider } from 'react-native-wagmi-charts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is not configured');
}

interface InsightData {
  question: string;
  value: number;
  explanation: string;
  timestamp: number;
}

async function callGPT(prompt: string): Promise<string> {
  try {
    console.log('Calling GPT API with prompt:', prompt);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GPT API Error Response:', errorData);
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('GPT API Full Response:', data);
    console.log('GPT Response Content:', data.choices[0].message.content);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('GPT API Error:', error);
    throw error;
  }
}

function parseGPTResponse(response: string): { value: number; explanation: string }[] {
  try {
    console.log('Parsing GPT response:', response);
    const lines = response.split('\n').filter(line => line.trim());
    console.log('Split lines:', lines);
    
    const results: { value: number; explanation: string }[] = [];
    let currentValue: number | null = null;
    let currentExplanation: string[] = [];
    
    lines.forEach(line => {
      console.log('Processing line:', line);
      // Check for lines with Question{X}
      const questionMatch = line.match(/Question\{(\d+)\}:/);
      
      if (questionMatch) {
        // If we have a previous value and explanation, save it
        if (currentValue !== null && currentExplanation.length > 0) {
          results.push({
            value: currentValue,
            explanation: currentExplanation.join(' ').trim()
          });
          currentExplanation = [];
        }
        // Set the new value
        currentValue = parseInt(questionMatch[1], 10);
        // Add the rest of the line to explanation
        const explanationPart = line.split(':')[1];
        if (explanationPart) {
          currentExplanation.push(explanationPart.trim());
        }
      } else if (currentValue !== null) {
        // Add this line to the current explanation
        currentExplanation.push(line.trim());
      }
    });
    
    // Don't forget to add the last item
    if (currentValue !== null && currentExplanation.length > 0) {
      results.push({
        value: currentValue,
        explanation: currentExplanation.join(' ').trim()
      });
    }

    console.log('Parsed results:', results);
    
    // Validate results
    if (results.length === 0) {
      throw new Error('No valid insights found in response');
    }
    
    return results;
  } catch (error) {
    console.error('Error parsing GPT response:', error);
    throw error;
  }
}

// First, let's define the questions at the top level
const ANALYSIS_QUESTIONS = [
  "How likely is the player to exceed their average performance?",
  "What's the player's success rate in similar matchups?",
  "How does the player perform under current conditions?",
  "What's the historical accuracy for this type of bet?",
  "How does recent form impact this bet?"
];

const calculateOverallPercentage = (insights: InsightData[]): number => {
  if (insights.length === 0) return 50;
  const sum = insights.reduce((acc, insight) => acc + insight.value, 0);
  return Math.round(sum / insights.length);
};

interface AnalyticsParams {
  player: string;
  bet: string;
  team?: string;
  opponent?: string;
  sport?: string;
  position?: string;
  time?: string;
  popularity?: string;
}

const AnalyticsScreen: React.FC = () => {
  const params = useLocalSearchParams<{
    player: string;
    bet: string;
    team?: string;
    opponent?: string;
    sport?: string;
    position?: string;
    time?: string;
    popularity?: string;
  }>();
  const { player, bet } = params;
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000010',
    },
    scrollView: {
      flex: 1,
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000010',
    },
    header: {
      padding: 16,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: '#FFFFFF20',
      backgroundColor: '#000010',
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#1E90FF',
      backgroundColor: '#000010',
    },
    subtitle: {
      fontSize: 16,
      color: '#1E90FF',
      backgroundColor: '#000010',
    },
    chartContainer: {
      padding: 16,
      marginTop: 20,
      backgroundColor: '#000010',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#000010',
    },
    chart: {
      borderRadius: 16,
    },
    insightsContainer: {
      padding: 16,
      gap: 16,
      backgroundColor: '#000010',
    },
    insightCard: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FFFFFF20',
      backgroundColor: '#000010',
    },
    insightQuestion: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 12,
      color: '#1E90FF',
    },
    insightValueContainer: {
      marginBottom: 12,
      backgroundColor: '#FFFFFF08',
      padding: 8,
      borderRadius: 8,
    },
    insightValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#1E90FF',
      backgroundColor: '#000010',
    },
    confidenceBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF15',
    },
    insightExplanation: {
      fontSize: 14,
      color: '#FFFFFF99',
      lineHeight: 20,
    },
    overallContainer: {
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#FFFFFF20',
      backgroundColor: '#000010',
      margin: 16,
      borderRadius: 16,
      borderWidth: 1,
    },
    overallLabel: {
      fontSize: 16,
      color: '#1E90FF',
      marginBottom: 8,
      fontWeight: '800',
    },
    overallPercentage: {
      fontSize: 48,
      fontWeight: 'bold',
    },
    winProbability: {
      fontSize: 14,
      color: '#1E90FF',
      marginTop: 4,
    },
    backButton: {
      position: 'absolute',
      top: 20,
      left: 16,
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#000010',
    },
    headerTextContainer: {
      flex: 1,
      alignItems: 'center',
    },
    loadingContent: {
      alignItems: 'center',
      gap: 12,
    },
    analyzingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    analyzingText: {
      fontSize: 16,
      color: '#1E90FF',
      fontWeight: '600',
    },
    loadingDots: {
      opacity: 0.8,
    },
  });

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      console.log('Fetching insights with params:', params);

      const prompt = `You are a sports betting analysis AI with access to comprehensive historical data and trends. Using your knowledge, analyze this betting prediction:

Game Details:
- Team: ${params.team || 'N/A'}
- Opponent: ${params.opponent || 'N/A'}
- Sport: ${params.sport || 'N/A'}
- Game Time: ${params.time || 'N/A'}
- Bet Type: ${bet}

REQUIRED FORMAT: You must respond with exactly 5 lines, each following this format:
Question{X}: Your detailed explanation

Where X is a number 0-100 representing probability/confidence, followed by your explanation.

Analyze these 5 aspects (MUST answer all 5):

Question{X}: Based on ${params.team}'s historical performance and current season stats, analyze their likelihood of winning against ${params.opponent}.

Question{X}: Looking at past matchups between ${params.team} and ${params.opponent}, evaluate their head-to-head record and performance trends.

Question{X}: Consider ${params.team}'s performance in similar game conditions (time slot, home/away, etc.).

Question{X}: Analyze the historical reliability of similar betting odds and outcomes for ${params.team}.

Question{X}: Evaluate ${params.team}'s recent form, including last 5 games performance and any key player statistics.

IMPORTANT: 
- You MUST provide numerical values in {X} format for each question
- You MUST provide detailed explanations
- Use your knowledge to make educated estimates
- Do NOT mention limitations about data access
- Respond as if you have access to all historical data`;

      const gptResponse = await callGPT(prompt);
      console.log('Raw GPT response:', gptResponse);

      if (!gptResponse || typeof gptResponse !== 'string') {
        throw new Error('Invalid GPT response format');
      }

      const parsedResults = parseGPTResponse(gptResponse);
      
      if (parsedResults.length === 0) {
        throw new Error('No valid insights could be parsed from the response');
      }

      const newInsights: InsightData[] = ANALYSIS_QUESTIONS.map((question, index) => ({
        question,
        value: parsedResults[index]?.value ?? 50,
        explanation: parsedResults[index]?.explanation || 
          "Unable to generate analysis at this time. Please try again.",
        timestamp: Date.now() + (index * 1000),
      }));

      console.log('Setting insights:', newInsights);
      setInsights(newInsights);
    } catch (error) {
      console.error('Error in fetchAIInsights:', error);
      
      // Create more informative fallback insights
      const mockInsights: InsightData[] = ANALYSIS_QUESTIONS.map((question, index) => ({
        question,
        value: 50,
        explanation: "We're experiencing technical difficulties. Please try refreshing the page.",
        timestamp: Date.now() + (index * 1000),
      }));
      
      setInsights(mockInsights);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!player || !bet) {
      console.error('Missing required parameters:', { player, bet });
      return;
    }
    
    console.log('Starting analysis for:', { player, bet });
    fetchAIInsights();
  }, [player, bet]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#1E90FF" />
          <View style={styles.analyzingContainer}>
            <ThemedText style={styles.analyzingText}>Analyzing</ThemedText>
            <MaterialCommunityIcons 
              name="dots-horizontal" 
              size={24} 
              color="#1E90FF"
              style={styles.loadingDots}
            />
          </View>
        </View>
      </ThemedView>
    );
  }

  const chartData = insights.map(insight => ({
    timestamp: insight.timestamp,
    value: insight.value,
  }));

  return (
    <ThemedView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView}>
          <ThemedView style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1E90FF" />
            </TouchableOpacity>
            <ThemedView style={styles.headerTextContainer}>
              <ThemedText type="title" style={styles.title}>
                AI Betting Insights
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {player} - {bet}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.overallContainer}>
            <ThemedText style={styles.overallLabel}>Overall Win Probability</ThemedText>
            <ThemedText 
              style={[
                styles.overallPercentage,
                { color: calculateOverallPercentage(insights) > 50 ? '#1E90FF' : '#1E90FF' }
              ]}
            >
              {calculateOverallPercentage(insights)}%
            </ThemedText>
            <ThemedText style={styles.winProbability}>
              {calculateOverallPercentage(insights) > 75 ? 'Strong Bet' : 
               calculateOverallPercentage(insights) > 50 ? 'Moderate Chance' : 'Risky Bet'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.chartContainer}>
            <LineChartProvider data={chartData}>
              <LineChart height={220}>
                <LineChart.Path color="#1E90FF" />
                <LineChart.CursorCrosshair color="#1E90FF" />
              </LineChart>
            </LineChartProvider>
          </ThemedView>

          <ThemedView style={styles.insightsContainer}>
            {insights.map((insight, index) => (
              <ThemedView key={index} style={styles.insightCard}>
                <ThemedText style={styles.insightQuestion}>
                  {insight.question}
                </ThemedText>
                <ThemedView style={styles.insightValueContainer}>
                  <ThemedText style={[
                    styles.insightValue,
                    { color: insight.value > 50 ? '#1E90FF' : '#1E90FF' },
                    { backgroundColor: insight.value > 50 ? '#000010' : '#000010' }
                  ]}>
                    {insight.value}%
                  </ThemedText>
                  <View style={[
                    styles.confidenceBar,
                    { width: `${insight.value}%` },
                    { 
                      backgroundColor: insight.value > 50 
                        ? 'rgba(30, 144, 255, 0.7)'
                        : 'rgba(30, 144, 255, 0.4)'
                    }
                  ]} />
                </ThemedView>
                <ThemedText style={styles.insightExplanation}>
                  {insight.explanation}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ScrollView>
      </GestureHandlerRootView>
    </ThemedView>
  );
};

export default AnalyticsScreen; 