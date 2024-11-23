import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getAuthToken } from '../constants/User'; // Ajusta la ruta según la ubicación de User.tsx

export default function TokenScreen() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = await getAuthToken();
      setToken(savedToken);
    };

    fetchToken();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Token Guardado</Text>
      <Text style={styles.tokenText}>
        {token ? token : 'No se encontró ningún token.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  tokenText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
