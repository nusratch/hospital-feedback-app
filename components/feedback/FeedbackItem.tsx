import { View, Text, StyleSheet } from 'react-native';
import { Star, Check, Clock, AlertCircle, CheckCircle2 } from 'lucide-react-native';
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
  // Helper function to get status icon and color
  const getStatusInfo = (status: FeedbackStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: <Check size={12} color="white" />,
          color: Colors.success,
          text: 'Completed'
        };
      case 'in-progress':
        return {
          icon: <Clock size={12} color="white" />,
          color: Colors.warning,
          text: 'In Progress'
        };
      case 'reviewed':
        return {
          icon: <CheckCircle2 size={12} color="white" />,
          color: Colors.primary,
          text: 'Reviewed'
        };
      case 'submitted':
      default:
        return {
          icon: <AlertCircle size={12} color="white" />,
          color: Colors.text.secondary,
          text: 'Submitted'
        };
    }
  };

  const statusInfo = getStatusInfo(feedback.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hospitalName}>{feedback.hospitalName}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.color }
          ]}
        >
          {statusInfo.icon}
          <Text style={styles.statusText}>
            {statusInfo.text}
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