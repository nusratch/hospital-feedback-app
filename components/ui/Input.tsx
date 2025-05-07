import { TextInput, View, Text, StyleSheet, StyleProp, ViewStyle, TextInputProps } from 'react-native';
import Colors from '@/constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : {},
          props.multiline ? styles.multilineInput : {},
        ]}
        placeholderTextColor={Colors.gray[400]}
        {...props}
      />
      
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
  input: {
    backgroundColor: 'white',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: Colors.text.primary,
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