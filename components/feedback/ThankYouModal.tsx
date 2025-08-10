import { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
} from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';

interface ThankYouModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThankYouModal({ visible, onClose }: ThankYouModalProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<ConfettiCannon>(null);
  
  useEffect(() => {
    if (visible) {
      // Reset animations
      checkmarkAnim.setValue(0);
      
      // Start animations when modal becomes visible
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After modal animation completes, animate the checkmark
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          // Fire confetti after checkmark animation
          if (confettiRef.current) {
            setTimeout(() => {
              confettiRef.current?.start();
            }, 200);
          }
        });
      });
    } else {
      // Reset animations when modal is hidden
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  // Animated values for the checkmark drawing effect
  const checkmarkStrokeOpacity = checkmarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const checkmarkPathLength = checkmarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#ffffff', '#f8fbff']}
            style={styles.modalContent}
          >
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Animated.View
                  style={[
                    styles.checkmarkContainer,
                    {
                      opacity: checkmarkStrokeOpacity,
                    },
                  ]}
                >
                  <Check 
                    size={36} 
                    color="white" 
                    strokeWidth={3}
                    style={{
                      strokeDasharray: [100],
                      strokeDashoffset: checkmarkPathLength.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    } as any}
                  />
                </Animated.View>
              </View>
            </View>
            
            <Text style={styles.title}>Thank You!</Text>
            <Text style={styles.message}>
              Your feedback has been successfully submitted. We appreciate your time and valuable input.
            </Text>
            
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingInfoText}>
                Your feedback helps us improve our services and provide better healthcare experiences.
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Return to Home</Text>
            </TouchableOpacity>
            
            <View style={styles.decorativeElement}>
              <View style={styles.decorativeLine} />
              <View style={styles.decorativeCircle} />
              <View style={styles.decorativeLine} />
            </View>
          </LinearGradient>
        </Animated.View>
        
        {visible && (
          <ConfettiCannon
            ref={confettiRef}
            count={100}
            origin={{ x: screenWidth / 2, y: 0 }}
            explosionSpeed={350}
            fallSpeed={3000}
            fadeOut={true}
            colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#7A77FF', '#F9F871']}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 28,
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingInfo: {
    backgroundColor: 'rgba(79, 209, 197, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  ratingInfoText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  decorativeElement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    justifyContent: 'center',
  },
  decorativeLine: {
    height: 2,
    width: 40,
    backgroundColor: `${Colors.success}50`,
    borderRadius: 1,
  },
  decorativeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    marginHorizontal: 8,
  }
});