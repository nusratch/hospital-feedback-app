import { View, Text, StyleSheet } from 'react-native';
import { Star, Check, Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { FeedbackStatus } from '@/types';

interface FeedbackItemProps {
  feedback: {
    id: string;
    hospitalName: string;
    averageRating: number;
    date: string;
    status: FeedbackStatus;
  };
}

export default function FeedbackItem({ feedback }: FeedbackItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hospitalName}>{feedback.hospitalName}</Text>
        <View
          style={[
            styles.statusBadge,
            feedback.status === 'completed'
              ? styles.completedBadge
              : styles.inProgressBadge,
          ]}
        >
          {feedback.status === 'completed' ? (
            <Check size={12} color="white" />
          ) : (
            <Clock size={12} color="white" />
          )}
          <Text style={styles.statusText}>
            {feedback.status === 'completed' ? 'Completed' : 'In Progress'}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.ratingContainer}>
          <Star size={16} color={Colors.gold} fill={Colors.gold} />
          <Text style={styles.ratingText}>{feedback.averageRating.toFixed(1)}</Text>
        </View>
        <Text style={styles.dateText}>{feedback.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedBadge: {
    backgroundColor: Colors.success,
  },
  inProgressBadge: {
    backgroundColor: Colors.warning,
  },
  statusText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 10,
    color: 'white',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 4,
  },
  dateText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
});