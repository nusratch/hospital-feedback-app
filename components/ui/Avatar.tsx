import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Colors from '@/constants/Colors';

interface AvatarProps {
  size: number;
  name: string;
  source?: ImageSourcePropType;
  imageUrl?: string; // For backward compatibility
}

export default function Avatar({ size, name, source, imageUrl }: AvatarProps) {
  const getInitials = (name: string) => {
    if (!name) return 'U';
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

  // Use source prop if provided, otherwise fall back to imageUrl
  const imageSource = source || (imageUrl ? { uri: imageUrl } : undefined);

  return (
    <View>
      {imageSource ? (
        <Image 
          source={imageSource} 
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
  )
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