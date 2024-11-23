import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function AnnouncementsScreen() {
  const [gymStatus, setGymStatus] = useState('Abierto');
  const [membershipStatus, setMembershipStatus] = useState('Activa'); 
  const [membershipExpiry, setMembershipExpiry] = useState('2024-12-31'); 

  // Configuración inicial de las notificaciones push
  useEffect(() => {
    registerForPushNotificationsAsync();
    const subscription = Notifications.addNotificationReceivedListener(handleNotification);
    return () => subscription.remove();
  }, []);
const handleNotification = (notification: Notifications.Notification) => {
  // Lógica para manejar la notificación cuando llega al dispositivo
  const messageBody = notification.request.content.body ?? 'No hay contenido en la notificación';
  Alert.alert('Notificación recibida', messageBody);
};


  const sendTestNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Renovación de Membresía",
        body: "Tu membresía está a punto de vencer. ¡Renueva ahora!",
      },
      trigger: { seconds: 2 }, 
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFF" />

      <Text style={styles.title}>Estado del Gimnasio</Text>
      <Text style={styles.status}>{gymStatus === 'Abierto' ? '🟢 Abierto' : '🔴 Cerrado'}</Text>

      <Text style={styles.title}>Estado de tu Membresía</Text>
      <Text style={styles.status}>
        {membershipStatus === 'Activa'
          ? 'Tu membresía está activa.'
          : 'Tu membresía ha vencido.'}
      </Text>
      {membershipExpiry && (
        <Text style={styles.expiry}>Fecha de vencimiento: {membershipExpiry}</Text>
      )}

      <Button title="Enviar notificación de prueba" onPress={sendTestNotification} />
    </View>
  );
}


async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (status !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Debes habilitar las notificaciones para recibir anuncios.');
    return;
  }


  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  expiry: {
    fontSize: 16,
    color: 'red',
  },
});
