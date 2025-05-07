import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import Colors from '@/constants/Colors';

interface HeaderProps {
  title: string;
  rightIcon?: ReactNode;
  onRightPress?: () => void;
}

export default function Header({ title, rightIcon, onRightPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {rightIcon && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={onRightPress}
        >
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: Colors.text.primary,
  },
  rightButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
});