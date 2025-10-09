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
      setData(list);
      setLoading(false);
    };
    load();
  }, []);

  // Derive month-wise counts
  const monthCounts = useMemo(() => {
    const counts = new Array(12).fill(0);
    data.forEach(item => {
      const parts = (item.createAt || '').split(' ');
      const mon = parts[1];
      const idx = MONTHS.findIndex(m => m.toLowerCase() === (mon || '').substring(0,3).toLowerCase());
      if (idx >= 0) counts[idx] += 1;
    });
    return counts;
  }, [data]);

  // Positive/Negative counts
  const { positive, negative } = useMemo(() => {
    let pos = 0, neg = 0;
    data.forEach(d => {
      if ((d.feedbackType || '').toLowerCase() === 'positive') pos++; else neg++;
    });
    return { positive: pos, negative: neg };
  }, [data]);

  // Prepare AmCharts-friendly data
  const columnChartData: ChartDatum[] = useMemo(() => (
    MONTHS.map((m, i) => ({ category: m, value: monthCounts[i] || 0 }))
  ), [monthCounts]);

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
