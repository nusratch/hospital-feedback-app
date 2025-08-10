import { useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  StyleProp, 
  ViewStyle,
  Animated,
  Pressable
} from 'react-native';
import Colors from '@/constants/Colors';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function AnimatedButton({ title, onPress, style, disabled }: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={({ pressed }) => [
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <Animated.View 
        style={[
          styles.button,
          style,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={styles.text}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: 'white',
  },
});