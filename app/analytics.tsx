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
    const lines = response.split('\n');
    console.log('Split lines:', lines);
    
    const results: { value: number; explanation: string }[] = [];
    
    lines.forEach(line => {
      console.log('Processing line:', line);
      // Look for patterns like "Question1{75}: Explanation" or "Question1{75} Explanation"
      const match = line.match(/Question\d+{(\d+)}[:\s]*(.*)/);
      if (match) {
        console.log('Found match:', match);
        const value = parseInt(match[1], 10);
        const explanation = match[2]?.trim() || '';
        results.push({ value, explanation });
      }
    });

    console.log('Parsed results:', results);
    return results;
  } catch (error) {
    console.error('Error parsing GPT response:', error);
    return [];
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
    },
    subtitle: {
      fontSize: 16,
      color: '#1E90FF',
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
  });

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      console.log('Fetching insights with params:', params);

      // Update the prompt to be more explicit about the response format
      const prompt = `Analyze this sports betting prediction with specific percentages and explanations:

Game Details:
- Player: ${player}
- Bet Type: ${bet}
- Team: ${params.team || 'N/A'}
- Opponent: ${params.opponent || 'N/A'}
- Sport: ${params.sport || 'N/A'}
- Position: ${params.position || 'N/A'}
- Game Time: ${params.time || 'N/A'}
- Popularity: ${params.popularity || 'N/A'}

Respond EXACTLY in this format for each question (including the "Question" prefix and curly braces):
Question1{75}: Detailed explanation here
Question2{80}: Another detailed explanation
etc.

Answer these questions:
1. How likely is ${player} to exceed their average performance in ${bet}?
2. What's ${player}'s success rate in matchups against ${params.opponent || 'this opponent'}?
3. How does ${player} typically perform under similar game conditions?
4. What's the historical accuracy for this type of bet?
5. How does ${player}'s recent form impact this bet?

Base your analysis on historical performance, matchup statistics, and current form.
Each response MUST start with "Question" followed by the number, then the percentage in curly braces, then a colon and explanation.`;

      const gptResponse = await callGPT(prompt);
      console.log('Received GPT response:', gptResponse);
      
      const parsedResults = parseGPTResponse(gptResponse);
      console.log('Parsed results:', parsedResults);

      const newInsights: InsightData[] = ANALYSIS_QUESTIONS.map((question, index) => {
        const insight = {
          question,
          value: parsedResults[index]?.value ?? 50,
          explanation: parsedResults[index]?.explanation || "Analysis not available",
          timestamp: Date.now() + (index * 1000),
        };
        console.log(`Created insight ${index + 1}:`, insight);
        return insight;
      });

      console.log('Setting insights:', newInsights);
      setInsights(newInsights);
    } catch (error) {
      console.error('Error in fetchAIInsights:', error);
      // More informative fallback data
      const mockInsights: InsightData[] = ANALYSIS_QUESTIONS.map((question, index) => ({
        question,
        value: 50,
        explanation: "Unable to fetch AI analysis. Please try again later.",
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
        <ActivityIndicator size="large" color="#1E90FF" />
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