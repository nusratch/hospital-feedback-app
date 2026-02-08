import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Colors from '@/constants/Colors';
import { fetchFeedbackCounts, FeedbackCountItem } from '@/services/analytics';
import { ChevronLeft } from 'lucide-react-native';
import { AmChartsColumnChart, AmChartsPie3DChart } from '@/components/charts/AmCharts';
import type { ChartDatum } from '@/types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type MetricsJsonResponse = {
  title?: string;
  dataset_rows?: number;
  sentiment?: {
    accuracy?: number;
    f1?: number;
    confusion_matrix?: number[][];
    classification_report?: {
      negative?: { support?: number };
      positive?: { support?: number };
      accuracy?: number;
    };
  };
  field_importance?: {
    average_accuracy?: number;
    average_f1?: number;
    per_field?: Array<{ field: string; accuracy: number; f1: number }>;
    confusion_matrices?: Record<string, number[][]>;
  };
};

const METRICS_API_URL = 'https://hospital-feedback-api.onrender.com/api/metrics-json';

export function AnalyticsContent({ embedded = false }: { embedded?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FeedbackCountItem[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsJsonResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchFeedbackCounts();
      console.log('Analytics data received:', list.length, 'items');
      if (list.length > 0) {
        console.log('Sample item:', JSON.stringify(list[0]));
        const types = [...new Set(list.map(item => item.feedbackType))];
        console.log('Unique feedback types:', types);
      }
      setData(list);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadMetricsWithRetry = async (retries = 3) => {
      setMetricsLoading(true);
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Fetching metrics from ${METRICS_API_URL} (Attempt ${i + 1})...`);
          
          // Use a long timeout controller since the API is slow (Render free tier cold starts)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

          const res = await fetch(METRICS_API_URL, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            }
          });
          
          clearTimeout(timeoutId);
          
          console.log('Metrics API response status:', res.status);
          if (!res.ok) throw new Error(`Attempt ${i + 1} failed with status ${res.status}`);
          
          const json = (await res.json()) as MetricsJsonResponse;
          setMetrics(json);
          setMetricsLoading(false);
          return; // Success
        } catch (e: any) {
          console.error(`Metrics fetch error (Attempt ${i + 1}):`, e.name === 'AbortError' ? 'Timeout' : e.message);
          
          if (i === retries - 1) {
            setMetrics(null);
            setMetricsLoading(false);
          } else {
            // Wait 2 seconds before retrying to give the server more time to wake up
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    };

    loadMetricsWithRetry();
  }, []);

  // Helper to parse dates for sorting
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('-')) return new Date(dateStr);
    // For "09 Aug 2025"
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const mon = parts[1];
      const year = parseInt(parts[2], 10);
      const monthIdx = MONTHS.findIndex(m => m.toLowerCase() === mon.substring(0, 3).toLowerCase());
      if (monthIdx !== -1) return new Date(year, monthIdx, day);
    }
    return new Date(0);
  };

  // Group data by date
  const groupedData = useMemo(() => {
    const totalByDate: Record<string, number> = {};
    const positiveByDate: Record<string, number> = {};
    const negativeByDate: Record<string, number> = {};

    data.forEach(item => {
      const dateStr = item.createAt || 'Unknown';
      const isPositive = (item.feedbackType || '').toLowerCase().trim() === 'positive';

      totalByDate[dateStr] = (totalByDate[dateStr] || 0) + 1;
      if (isPositive) {
        positiveByDate[dateStr] = (positiveByDate[dateStr] || 0) + 1;
      } else {
        negativeByDate[dateStr] = (negativeByDate[dateStr] || 0) + 1;
      }
    });

    // Get all unique dates and sort them chronologically
    const allDates = Object.keys(totalByDate).sort((a, b) => {
      return parseDate(a).getTime() - parseDate(b).getTime();
    });

    return {
      allDates,
      totalByDate,
      positiveByDate,
      negativeByDate
    };
  }, [data]);

  // Positive/Negative counts for the pie chart
  const { positive, negative } = useMemo(() => {
    let pos = 0, neg = 0;
    data.forEach(d => {
      if ((d.feedbackType || '').toLowerCase().trim() === 'positive') pos++; else neg++;
    });
    return { positive: pos, negative: neg };
  }, [data]);

  // Prepare AmCharts-friendly data (Date-wise)
  const columnChartData: ChartDatum[] = useMemo(() => (
    groupedData.allDates.map(date => ({ 
      category: date, 
      value: groupedData.totalByDate[date] || 0 
    }))
  ), [groupedData]);

  const positiveColumnChartData: ChartDatum[] = useMemo(() => (
    groupedData.allDates.map(date => ({ 
      category: date, 
      value: groupedData.positiveByDate[date] || 0 
    }))
  ), [groupedData]);

  const negativeColumnChartData: ChartDatum[] = useMemo(() => (
    groupedData.allDates.map(date => ({ 
      category: date, 
      value: groupedData.negativeByDate[date] || 0 
    }))
  ), [groupedData]);

  const pieChartData: ChartDatum[] = useMemo(() => ([
    { category: 'Positive', value: positive },
    { category: 'Negative', value: negative }
  ]), [positive, negative]);
  const modelSentimentSplitData = useMemo(() => {
    if (!metrics?.sentiment?.classification_report) return [];
    return [
      { category: 'Negative', value: metrics.sentiment.classification_report.negative?.support || 0 },
      { category: 'Positive', value: metrics.sentiment.classification_report.positive?.support || 0 },
    ];
  }, [metrics]);

  const modelConfusionMatrix = useMemo(() => metrics?.sentiment?.confusion_matrix || null, [metrics]);

  const departmentConfusionMatrices = useMemo(() => {
    const cms = metrics?.field_importance?.confusion_matrices;
    const perField = metrics?.field_importance?.per_field || [];
    if (!cms) return [];
    return Object.entries(cms).map(([field, matrix]) => {
      const fieldStats = perField.find(f => f.field === field);
      return {
        field,
        matrix,
        accuracy: fieldStats?.accuracy || 0,
        f1: fieldStats?.f1 || 0,
      };
    });
  }, [metrics]);

  // if (loading) {
  //   return (
  //     <View style={embedded ? styles.embeddedContainer : styles.container}>
  //       {!embedded && <Header title="Analytics" />}
  //       <View style={styles.centered}>
  //         <ActivityIndicator size="large" color={Colors.primary} />
  //         <Text style={styles.loadingText}>Loading analytics...</Text>
  //       </View>
  //     </View>
  //   );
  // }

  return (
    <View style={embedded ? styles.embeddedContainer : styles.container}>
      {!embedded && <Header title="Analytics" />}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!embedded && (
          <View style={styles.topBar}>
            <BackButton />
            <Text style={styles.pageTitle}>Insights Dashboard</Text>
          </View>
        )}

        {/* Bar Chart Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Feedback Count</Text>
          <Text style={styles.cardSubtitle}>Month-wise submissions</Text>
          <View style={styles.chartCenter}>
            <AmChartsColumnChart
              data={columnChartData}
              categoryField="category"
              valueField="value"
              height={260}
            />
          </View>
        </View>

        {/* Positive Feedback Count Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Positive Feedback Count</Text>
          <Text style={styles.cardSubtitle}>Month-wise positive submissions</Text>
          <View style={styles.chartCenter}>
            <AmChartsColumnChart
              data={positiveColumnChartData}
              categoryField="category"
              valueField="value"
              height={260}
            />
          </View>
        </View>

        {/* Negative Feedback Count Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Negative Feedback Count</Text>
          <Text style={styles.cardSubtitle}>Month-wise negative submissions</Text>
          <View style={styles.chartCenter}>
            <AmChartsColumnChart
              data={negativeColumnChartData}
              categoryField="category"
              valueField="value"
              height={260}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sentiment Split</Text>
          <Text style={styles.cardSubtitle}>Positive vs Negative</Text>
          <View style={styles.pieContainer}>
            <AmChartsPie3DChart
              data={pieChartData}
              categoryField="category"
              valueField="value"
              height={260}
            />
            {/* <View style={styles.legendBelow}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.legendText}>Positive: {positive}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                <Text style={styles.legendText}>Negative: {negative}</Text>
              </View>
            </View> */}
          </View>
        </View>

        {/* Model Metrics (separate API) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Prediction Model Metrics</Text>
          <Text style={styles.cardSubtitle}>Maternity Feedback Prediction - Metrics</Text>
          {metricsLoading ? (
            <View style={styles.chartCenter}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : metrics ? (
            <>
              <View style={styles.chartCenter}>
                <AmChartsPie3DChart
                  data={modelSentimentSplitData}
                  categoryField="category"
                  valueField="value"
                  height={260}
                />
              </View>
              {modelConfusionMatrix ? (
                <View style={styles.chartCenter}>
                  <View style={styles.heatmapContainer}>
                    <Text style={styles.heatmapMainTitle}>Sentiment Model - Confusion Matrix</Text>
                    <Text style={styles.heatmapSubtitle}>
                      Acc: {(metrics?.sentiment?.accuracy || 0).toFixed(3)} | F1: {(metrics?.sentiment?.f1 || 0).toFixed(3)}
                    </Text>
                    
                    <View style={styles.heatmapBody}>
                      {/* Y-axis label */}
                      <View style={styles.yAxisLabelContainer}>
                        <Text style={styles.yAxisLabel}>Actual</Text>
                      </View>

                      <View style={styles.heatmapContent}>
                        {/* Matrix Rows */}
                        <View style={styles.heatmapRow}>
                          <Text style={styles.rowLabel}>Negative</Text>
                          <View style={[styles.heatmapCell, { backgroundColor: modelConfusionMatrix[0][0] > 0 ? '#08306b' : '#f7fbff' }]}>
                            <Text style={[styles.heatmapValue, { color: modelConfusionMatrix[0][0] > 1000 ? 'white' : 'black' }]}>{modelConfusionMatrix[0][0]}</Text>
                          </View>
                          <View style={[styles.heatmapCell, { backgroundColor: modelConfusionMatrix[0][1] > 0 ? '#08306b' : '#f7fbff' }]}>
                            <Text style={[styles.heatmapValue, { color: modelConfusionMatrix[0][1] > 1000 ? 'white' : 'black' }]}>{modelConfusionMatrix[0][1]}</Text>
                          </View>
                        </View>

                        <View style={styles.heatmapRow}>
                          <Text style={styles.rowLabel}>Positive</Text>
                          <View style={[styles.heatmapCell, { backgroundColor: modelConfusionMatrix[1][0] > 0 ? '#deebf7' : '#f7fbff' }]}>
                            <Text style={[styles.heatmapValue, { color: 'black' }]}>{modelConfusionMatrix[1][0]}</Text>
                          </View>
                          <View style={[styles.heatmapCell, { backgroundColor: modelConfusionMatrix[1][1] > 0 ? '#deebf7' : '#f7fbff' }]}>
                            <Text style={[styles.heatmapValue, { color: 'black' }]}>{modelConfusionMatrix[1][1]}</Text>
                          </View>
                        </View>

                        {/* X-axis labels */}
                        <View style={styles.xAxisLabels}>
                          <View style={styles.xAxisLabelBox}><Text style={styles.xAxisText}>Negative</Text></View>
                          <View style={styles.xAxisLabelBox}><Text style={styles.xAxisText}>Positive</Text></View>
                        </View>
                        
                        <Text style={styles.xAxisTitle}>Predicted</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.chartCenter}>
                  <Text style={styles.cardSubtitle}>Confusion matrix unavailable</Text>
                </View>
              )}

              {/* Department-wise Confusion Matrices */}
              {departmentConfusionMatrices.length > 0 && (
                <View style={styles.departmentSection}>
                  <Text style={styles.sectionTitle}>Department-wise Performance</Text>
                  {departmentConfusionMatrices.map(({ field, matrix, accuracy, f1 }) => (
                    <View key={field} style={styles.departmentConfusionBox}>
                      <View style={styles.heatmapContainer}>
                        <Text style={styles.heatmapMainTitle}>
                          {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Text>
                        <Text style={styles.heatmapSubtitle}>
                          Acc: {accuracy.toFixed(3)} | F1: {f1.toFixed(3)}
                        </Text>
                        
                        <View style={styles.heatmapBody}>
                          <View style={styles.yAxisLabelContainer}>
                            <Text style={styles.yAxisLabel}>Actual</Text>
                          </View>

                          <View style={styles.heatmapContent}>
                            <View style={styles.heatmapRow}>
                              <Text style={styles.rowLabel}>Negative</Text>
                              <View style={[styles.heatmapCell, { backgroundColor: matrix[0][0] > 0 ? '#08306b' : '#f7fbff' }]}>
                                <Text style={[styles.heatmapValue, { color: matrix[0][0] > 1000 ? 'white' : 'black' }]}>{matrix[0][0]}</Text>
                              </View>
                              <View style={[styles.heatmapCell, { backgroundColor: matrix[0][1] > 0 ? '#08306b' : '#f7fbff' }]}>
                                <Text style={[styles.heatmapValue, { color: matrix[0][1] > 1000 ? 'white' : 'black' }]}>{matrix[0][1]}</Text>
                              </View>
                            </View>

                            <View style={styles.heatmapRow}>
                              <Text style={styles.rowLabel}>Positive</Text>
                              <View style={[styles.heatmapCell, { backgroundColor: matrix[1][0] > 0 ? '#deebf7' : '#f7fbff' }]}>
                                <Text style={[styles.heatmapValue, { color: 'black' }]}>{matrix[1][0]}</Text>
                              </View>
                              <View style={[styles.heatmapCell, { backgroundColor: matrix[1][1] > 0 ? '#deebf7' : '#f7fbff' }]}>
                                <Text style={[styles.heatmapValue, { color: 'black' }]}>{matrix[1][1]}</Text>
                              </View>
                            </View>

                            <View style={styles.xAxisLabels}>
                              <View style={styles.xAxisLabelBox}><Text style={styles.xAxisText}>Negative</Text></View>
                              <View style={styles.xAxisLabelBox}><Text style={styles.xAxisText}>Positive</Text></View>
                            </View>
                            
                            <Text style={styles.xAxisTitle}>Predicted</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.chartCenter}>
              <Text style={styles.cardSubtitle}>Unable to load metrics</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <ChevronLeft size={18} color={Colors.primary} />
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
  );
}

export default function AnalyticsDashboardScreen() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }
      if (user?.role !== 'super_admin') {
        router.replace('/(tabs)');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user?.role]);

  return <AnalyticsContent embedded={false} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  embeddedContainer: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 8, color: Colors.text.secondary },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: Colors.primary + '15', borderRadius: 8 },
  backText: { color: Colors.primary, marginLeft: 6, fontWeight: '600' },
  pageTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 4 },
  cardSubtitle: { color: Colors.text.secondary, marginBottom: 8 },
  chartCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  pieRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Center the pie chart within the card
  pieContainer: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  confusionMatrixBox: { width: '100%', backgroundColor: Colors.gray[100], borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.gray[200] },
  confusionMatrixTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, marginBottom: 10 },
  confusionMatrixTable: { width: '100%' },
  confusionMatrixRow: { flexDirection: 'row' },
  confusionMatrixCell: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  confusionMatrixHeaderCell: { backgroundColor: Colors.gray[100] },
  confusionMatrixHeaderText: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },
  confusionMatrixValueText: { fontSize: 13, fontWeight: '700', color: Colors.text.primary },
  legend: { paddingLeft: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { color: Colors.text.primary },
  // Place legend below the pie and center it
  legendBelow: { marginTop: 12, alignItems: 'center' },
  departmentSection: { marginTop: 24, width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray[200], paddingBottom: 8 },
  departmentConfusionBox: { marginBottom: 20, backgroundColor: 'white', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: Colors.gray[100] },
  departmentTitle: { fontSize: 14, fontWeight: '600', color: Colors.primary, marginBottom: 8 },
  heatmapContainer: { width: '100%', alignItems: 'center', padding: 10 },
  heatmapMainTitle: { fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 2 },
  heatmapSubtitle: { fontSize: 14, color: '#000', marginBottom: 15 },
  heatmapBody: { flexDirection: 'row', alignItems: 'center' },
  yAxisLabelContainer: { width: 30, alignItems: 'center', justifyContent: 'center' },
  yAxisLabel: { transform: [{ rotate: '-90deg' }], width: 100, textAlign: 'center', fontSize: 14, color: '#000', fontWeight: '400' },
  heatmapContent: { flex: 1, paddingLeft: 10 },
  heatmapRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  rowLabel: { width: 70, textAlign: 'right', marginRight: 10, fontSize: 14, color: '#000' },
  heatmapCell: { width: 100, height: 80, justifyContent: 'center', alignItems: 'center', marginHorizontal: 1 },
  heatmapValue: { fontSize: 16, fontWeight: '400' },
  xAxisLabels: { flexDirection: 'row', marginLeft: 80, marginTop: 5 },
  xAxisLabelBox: { width: 100, alignItems: 'center' },
  xAxisText: { fontSize: 14, color: '#000' },
  xAxisTitle: { textAlign: 'center', marginTop: 10, fontSize: 14, color: '#000', marginLeft: 80 },
});
