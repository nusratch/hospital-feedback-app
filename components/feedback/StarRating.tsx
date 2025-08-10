import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text, Vibration } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface StarRatingProps {
  maxRating?: number;
  rating: number;
  onRate: (rating: number) => void;
  size?: number;
  showLabel?: boolean;
}

export default function StarRating({ 
  maxRating = 5, 
  rating, 
  onRate, 
  size = 24,
  showLabel = true
}: StarRatingProps) {
  const animatedValues = useRef<Animated.Value[]>(
    Array(maxRating).fill(0).map(() => new Animated.Value(1))
  ).current;
  
  const animatedColors = useRef<Animated.Value[]>(
    Array(maxRating).fill(0).map(() => new Animated.Value(0))
  ).current;
  
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelPosition = useRef(new Animated.Value(10)).current;
  
  // Create an animated version of the Star component
  const AnimatedStar = useRef(Animated.createAnimatedComponent(Star)).current;
  
  useEffect(() => {
    // Animate stars based on current rating
    animatedColors.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index < rating ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
    
    // Show label if rating is set
    if (rating > 0 && showLabel) {
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(labelPosition, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(labelPosition, {
          toValue: 10,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [rating]);

  const handlePress = (selectedRating: number) => {
    // Provide haptic feedback
    Vibration.vibrate(5);
    
    // Animate the pressed star with bounce effect
    Animated.sequence([
      Animated.timing(animatedValues[selectedRating - 1], {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValues[selectedRating - 1], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate stars to the left of the pressed star
    for (let i = 0; i < selectedRating - 1; i++) {
      Animated.sequence([
        Animated.delay(i * 20),
        Animated.timing(animatedValues[i], {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValues[i], {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onRate(selectedRating);
  };
  
  const getRatingLabel = (rating: number): string => {
    switch(rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          
          // Interpolate color based on animated value
          const fillColor = animatedColors[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', Colors.gold]
          });
          
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
                activeOpacity={0.6}
                style={styles.starTouchable}
              >
                <Animated.View>
                  <AnimatedStar
                    size={size}
                    color={Colors.gold}
                    fill={fillColor}
                    strokeWidth={1.5}
                  />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      
      {showLabel && (
        <Animated.View
          style={[
            styles.labelContainer,
            { 
              opacity: labelOpacity,
              transform: [{ translateY: labelPosition }]
            }
          ]}
        >
          <Text style={styles.ratingLabel}>
            {getRatingLabel(rating)}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginRight: 8,
  },
  starTouchable: {
    padding: 4, // Larger touch target
  },
  labelContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  ratingLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  }
});