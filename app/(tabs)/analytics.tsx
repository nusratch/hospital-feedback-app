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

export function AnalyticsContent({ embedded = false }: { embedded?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FeedbackCountItem[]>([]);

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
  legend: { paddingLeft: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { color: Colors.text.primary },
  // Place legend below the pie and center it
  legendBelow: { marginTop: 12, alignItems: 'center' },
});
