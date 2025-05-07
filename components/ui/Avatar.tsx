import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '@/constants/Colors';

interface AvatarProps {
  size: number;
  name: string;
  imageUrl?: string;
}

export default function Avatar({ size, name, imageUrl }: AvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textSize = {
    fontSize: size / 2.5,
  };

  return (
    <View>
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={[styles.avatar, avatarStyle]} 
        />
      ) : (
        <View style={[styles.avatarPlaceholder, avatarStyle]}>
          <Text style={[styles.initialsText, textSize]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: 'white',
    fontFamily: 'Montserrat-SemiBold',
  },
});