import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { ThemedView } from './components/ThemedView';
import { ThemedText } from './components/ThemedText';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { LineChart, LineChartProvider } from 'react-native-wagmi-charts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is not configured');
}

interface InsightData {
  question: string;
  value: number;
  explanation?: string;
  timestamp: number;
}

async function callGPT(prompt: string): Promise<string> {
  try {
    console.log('Calling GPT API...');
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
    console.log('GPT API Response:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('GPT API Error:', error);
    throw error;
  }
}

function parseGPTResponse(response: string): { value: number; explanation: string }[] {
  try {
    // Split the response into lines
    const lines = response.split('\n');
    const results: { value: number; explanation: string }[] = [];

    lines.forEach(line => {
      // Look for patterns like "Question1{75}" or similar
      const match = line.match(/Question\d+{(\d+)}/);
      if (match) {
        const value = parseInt(match[1], 10);
        // Extract any additional explanation text after the number
        const explanation = line.split('}')[1]?.trim() || '';
        results.push({ value, explanation });
      }
    });

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
  const params = useLocalSearchParams<AnalyticsParams>();
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
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#FFFFFF',
    },
    subtitle: {
      fontSize: 16,
      color: '#FFFFFF80',
    },
    chartContainer: {
      padding: 16,
      marginTop: 20,
      backgroundColor: '#000020',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FFFFFF20',
    },
    chart: {
      borderRadius: 16,
    },
    insightsContainer: {
      padding: 16,
      gap: 16,
    },
    insightCard: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FFFFFF20',
      backgroundColor: '#000020',
    },
    insightQuestion: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      color: '#FFFFFF',
    },
    insightValueContainer: {
      marginBottom: 12,
    },
    insightValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#FFFFFF',
    },
    confidenceBar: {
      height: 4,
      borderRadius: 2,
    },
    insightExplanation: {
      fontSize: 14,
      color: '#FFFFFF80',
      lineHeight: 20,
    },
    overallContainer: {
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#FFFFFF20',
      backgroundColor: '#000020',
      margin: 16,
      borderRadius: 16,
      borderWidth: 1,
    },
    overallLabel: {
      fontSize: 16,
      color: '#FFFFFF80',
      marginBottom: 8,
    },
    overallPercentage: {
      fontSize: 48,
      fontWeight: 'bold',
    },
    winProbability: {
      fontSize: 14,
      color: '#FFFFFF80',
      marginTop: 4,
    },
  });

  const fetchAIInsights = async () => {
    try {
      setLoading(true);

      // Create a more detailed prompt using all available information
      const prompt = `The player you're analyzing is ${player}. Here's all the available information about this bet:

Player: ${player}
Bet Details: ${bet}
${params.team ? `Team: ${params.team}` : ''}
${params.opponent ? `Opponent: ${params.opponent}` : ''}
${params.sport ? `Sport: ${params.sport}` : ''}
${params.position ? `Position: ${params.position}` : ''}
${params.time ? `Game Time: ${params.time}` : ''}
${params.popularity ? `Bet Popularity: ${params.popularity}` : ''}

I need you to analyze this bet and respond in "0-100%" format (where 0 is very unfavorable and 100 is highly favorable).

1: How likely is the player to exceed their average performance in this ${bet}?
2: What's the player's success rate in similar matchups?
3: How does the player perform under current conditions?
4: What's the historical accuracy for this type of bet?
5: How does recent form impact this bet?

Respond to these questions EXACTLY like this format:
Question1{75}Additional explanation here
Question2{80}Additional explanation here

If you don't have enough information for any question, respond with Question{50} and explain why.
Do not include any other text in your response besides the Question{number}explanation format.`;

      const gptResponse = await callGPT(prompt);
      const parsedResults = parseGPTResponse(gptResponse);

      const newInsights: InsightData[] = ANALYSIS_QUESTIONS.map((question, index) => ({
        question,
        value: parsedResults[index]?.value ?? 50,
        explanation: parsedResults[index]?.explanation ?? "No explanation provided",
        timestamp: Date.now() + (index * 1000),
      }));

      setInsights(newInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      // Fallback to mock data in case of error
      const mockInsights: InsightData[] = ANALYSIS_QUESTIONS.map((question, index) => ({
        question,
        value: 50,
        explanation: "Failed to fetch AI analysis. Using default values.",
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
    
    console.log('Fetching insights for:', { player, bet });
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
            <ThemedText type="title" style={styles.title}>
              AI Betting Insights
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {player} - {bet}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.overallContainer}>
            <ThemedText style={styles.overallLabel}>Overall Win Probability</ThemedText>
            <ThemedText 
              style={[
                styles.overallPercentage,
                { color: calculateOverallPercentage(insights) > 50 ? '#4CAF50' : '#FF3B30' }
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
                    { color: insight.value > 50 ? '#4CAF50' : '#FF3B30' }
                  ]}>
                    {insight.value}%
                  </ThemedText>
                  <View style={[
                    styles.confidenceBar,
                    { width: `${insight.value}%` },
                    { backgroundColor: insight.value > 50 ? '#4CAF5040' : '#FF3B3040' }
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