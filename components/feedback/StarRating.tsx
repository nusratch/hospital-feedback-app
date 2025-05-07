import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface StarRatingProps {
  maxRating?: number;
  rating: number;
  onRate: (rating: number) => void;
  size?: number;
}

export default function StarRating({ maxRating = 5, rating, onRate, size = 24 }: StarRatingProps) {
  const [animatedValues] = useState<Animated.Value[]>(
    Array(maxRating).fill(0).map(() => new Animated.Value(1))
  );

  const handlePress = (selectedRating: number) => {
    // Animate the pressed star
    Animated.sequence([
      Animated.timing(animatedValues[selectedRating - 1], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[selectedRating - 1], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onRate(selectedRating);
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.starContainer,
              { transform: [{ scale: animatedValues[index] }] }
            ]}
          >
            <TouchableOpacity
              onPress={() => handlePress(starValue)}
              activeOpacity={0.7}
            >
              <Star
                size={size}
                color={Colors.gold}
                fill={isFilled ? Colors.gold : 'transparent'}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginRight: 8,
  },
});