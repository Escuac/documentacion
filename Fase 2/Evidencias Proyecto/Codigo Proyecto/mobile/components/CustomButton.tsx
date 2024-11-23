import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';


type CustomButtonProps = {
  title: string; 
  onPress: () => void; 
};

export default function CustomButton({ title, onPress }: CustomButtonProps) {  
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
