import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TextInputProps, 
  TextStyle,
} from 'react-native';
import Colors from '@/constants/Colors';
import { ReactNode } from 'react';

type InputStyle = StyleProp<TextStyle & ViewStyle>;

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  style?: InputStyle;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: ReactNode;
  inputContainerStyle?: StyleProp<ViewStyle>;
}

export default function Input({ 
  label, 
  error, 
  style, 
  containerStyle, 
  leftIcon,
  inputContainerStyle,
  ...props 
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, inputContainerStyle]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : {},
            props.multiline ? styles.multilineInput : {},
            leftIcon ? styles.inputWithLeftIcon : {},
            style,
          ]}
          placeholderTextColor={Colors.gray[400]}
          {...props}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: Colors.text.primary,
    // @ts-ignore - userSelect is valid but TypeScript types are incorrect
    userSelect: 'text',
  } as any,
  inputWithLeftIcon: {
    paddingLeft: 44, // Extra padding to make room for the icon
  },
  inputError: {
    borderColor: Colors.error,
  },
  multilineInput: {
    height: undefined,
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  errorText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});